
-- =========================================================
-- INTEGRA ESTÁGIO
-- MIGRATION 058
-- Validação da jornada e proteção da frequência
-- =========================================================

begin;

-- 1. Substitui a função de validação existente.

create or replace function public.validate_internship_attendance()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_internship record;
  v_authorization record;
  v_term record;
  v_minutes integer;
  v_expected_minutes integer;
  v_day text;
  v_today date;
  v_now_time time;
begin

  v_today := (now() at time zone 'America/Cuiaba')::date;
  v_now_time := (now() at time zone 'America/Cuiaba')::time;

  -- Localiza o estágio.

  select
    id,
    authorization_id,
    municipal_unit_id,
    start_date,
    end_date,
    status
  into v_internship
  from public.internships
  where id = new.internship_id;

  if not found then
    raise exception 'Estágio não encontrado.';
  end if;

  -- Confere a unidade.

  if new.municipal_unit_id is distinct from
     v_internship.municipal_unit_id then

    raise exception
      'A frequência não pertence à unidade responsável.';
  end if;

  -- Somente estágios em andamento.

  if v_internship.status <> 'em_andamento' then
    raise exception
      'A frequência somente pode ser lançada em estágio em andamento.';
  end if;

  -- Localiza a autorização.

  select
    id,
    presentation_id,
    status,
    authorized_start_date,
    authorized_end_date
  into v_authorization
  from public.internship_authorizations
  where id = v_internship.authorization_id;

  if not found then
    raise exception 'Autorização não encontrada.';
  end if;

  if v_authorization.status <> 'autorizado' then
    raise exception
      'O estágio não possui autorização válida para lançamento.';
  end if;

  -- Localiza o Termo de Compromisso.

  select
    weekly_days,
    daily_start_time,
    daily_end_time,
    break_minutes
  into v_term
  from public.commitment_terms
  where presentation_id = v_authorization.presentation_id
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Termo de Compromisso não encontrado.';
  end if;

  if v_term.weekly_days is null
     or cardinality(v_term.weekly_days) = 0
     or v_term.daily_start_time is null
     or v_term.daily_end_time is null
     or v_term.break_minutes is null then

    raise exception
      'O Termo de Compromisso não possui jornada completa.';
  end if;

  if v_term.daily_end_time <= v_term.daily_start_time
     or v_term.break_minutes < 0 then

    raise exception
      'A jornada cadastrada no Termo é inválida.';
  end if;

  -- Impede datas futuras.

  if new.attendance_date > v_today then
    raise exception
      'Não é permitido lançar frequência em data futura.';
  end if;

  -- Confere o período do estágio.

  if new.attendance_date < v_internship.start_date
     or (
       v_internship.end_date is not null
       and new.attendance_date > v_internship.end_date
     ) then

    raise exception
      'A data está fora do período do estágio.';
  end if;

  -- Confere o período formalmente autorizado.

  if new.attendance_date <
     v_authorization.authorized_start_date
     or (
       v_authorization.authorized_end_date is not null
       and new.attendance_date >
           v_authorization.authorized_end_date
     ) then

    raise exception
      'A data está fora do período autorizado.';
  end if;

  -- Identifica o dia da semana.
  -- ISO: segunda=1, domingo=7.

  v_day := case extract(isodow from new.attendance_date)::integer
    when 1 then 'segunda'
    when 2 then 'terca'
    when 3 then 'quarta'
    when 4 then 'quinta'
    when 5 then 'sexta'
    when 6 then 'sabado'
    when 7 then 'domingo'
  end;

  -- Confere os dias autorizados.

  if not exists (
    select 1
    from unnest(v_term.weekly_days) as d(day_name)
    where translate(
      lower(btrim(d.day_name)),
      'áàâãéêíóôõúç',
      'aaaaeeiooouc'
    ) = v_day
  ) then

    raise exception
      'O dia selecionado não está previsto na jornada autorizada.';
  end if;

  -- Impede alterações dos identificadores e autoria.

  if tg_op = 'UPDATE' then

    if new.id is distinct from old.id
       or new.internship_id is distinct from old.internship_id
       or new.municipal_unit_id is distinct from old.municipal_unit_id
       or new.attendance_date is distinct from old.attendance_date
       or new.created_at is distinct from old.created_at
       or new.created_by is distinct from old.created_by then

      raise exception
        'Não é permitido alterar identificação, data ou autoria.';
    end if;

    if nullif(
      btrim(coalesce(new.correction_reason, '')),
      ''
    ) is null
    or new.correction_reason is not distinct from
       old.correction_reason then

      raise exception
        'Informe uma nova justificativa para a correção.';
    end if;

  else

    new.created_by := auth.uid();
    new.correction_reason := null;

  end if;

  -- Calcula o máximo previsto no Termo.

  v_expected_minutes := (
    extract(
      epoch from (
        v_term.daily_end_time - v_term.daily_start_time
      )
    ) / 60
  )::integer - v_term.break_minutes;

  if v_expected_minutes <= 0 then
    raise exception
      'A carga diária prevista no Termo é inválida.';
  end if;

  -- Faltas não geram horas.

  if new.attendance_status in (
    'falta',
    'falta_justificada'
  ) then

    if new.start_time is not null
       or new.end_time is not null
       or new.break_minutes <> 0 then

      raise exception
        'Não informe horários ou intervalo para faltas.';
    end if;

    if new.attendance_status = 'falta_justificada'
       and nullif(btrim(coalesce(new.notes, '')), '') is null then

      raise exception
        'Informe a justificativa da falta.';
    end if;

    new.duration_minutes := 0;

  elsif new.attendance_status in (
    'presenca',
    'presenca_parcial'
  ) then

    if new.start_time is null
       or new.end_time is null then

      raise exception
        'Informe os horários de entrada e saída.';
    end if;

    if new.end_time <= new.start_time then
      raise exception
        'O horário de saída deve ser posterior à entrada.';
    end if;

    -- Não permite horários fora da jornada.

    if new.start_time < v_term.daily_start_time
       or new.end_time > v_term.daily_end_time then

      raise exception
        'Os horários informados ultrapassam a jornada autorizada.';
    end if;

    -- Não permite saída futura na data atual.

    if new.attendance_date = v_today
       and new.end_time > v_now_time then

      raise exception
        'Não é permitido registrar saída em horário futuro.';
    end if;

    v_minutes := (
      extract(
        epoch from (
          new.end_time - new.start_time
        )
      ) / 60
    )::integer;

    if new.break_minutes < 0
       or new.break_minutes > v_term.break_minutes
       or new.break_minutes >= v_minutes then

      raise exception
        'Intervalo incompatível com a jornada autorizada.';
    end if;

    new.duration_minutes :=
      v_minutes - new.break_minutes;

    if new.duration_minutes <= 0
       or new.duration_minutes > v_expected_minutes then

      raise exception
        'As horas efetivas ultrapassam a jornada prevista.';
    end if;

    -- Limite geral inicial: 6 horas efetivas por dia.
    -- Exceções legais exigem tratamento próprio.

    if new.duration_minutes > 360 then
      raise exception
        'Carga diária superior ao limite geral de seis horas.';
    end if;

  else

    raise exception
      'Situação de frequência inválida.';
  end if;

  -- Atualiza metadados automaticamente.

  new.updated_by := auth.uid();
  new.updated_at := now();

  return new;

end;
$$;

-- 2. Protege a tabela de histórico.

revoke all
on public.internship_attendance_history
from public, anon, authenticated;

grant select
on public.internship_attendance_history
to authenticated;

-- 3. Protege a tabela principal contra exclusão
--    pelos perfis comuns.

revoke delete
on public.internship_attendance
from public, anon, authenticated;

-- 4. Restringe a execução direta das funções.

revoke all
on function public.validate_internship_attendance()
from public, anon, authenticated;

revoke all
on function public.audit_internship_attendance()
from public, anon, authenticated;

commit;
