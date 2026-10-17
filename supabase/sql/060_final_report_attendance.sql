-- Integra Estágio
-- Migration 060 - Relatório final integrado à frequência

begin;

-- Permite preservar horas e minutos sem arredondar
-- para um número inteiro de horas.
alter table public.final_reports
  alter column completed_workload type numeric(12,2)
  using completed_workload::numeric(12,2);

-- Consulta da carga horária, restrita à unidade responsável.
create or replace function public.get_unit_closure_workload(
  p_internship_id uuid
)
returns table (
  completed_minutes bigint,
  required_hours numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_presentation_id uuid;
begin
  if not exists (
    select 1
    from public.profiles p
    join public.internships i
      on i.municipal_unit_id = p.municipal_unit_id
    where p.id = auth.uid()
      and p.role = 'unidade'
      and p.is_active = true
      and i.id = p_internship_id
  ) then
    raise exception 'Acesso não autorizado ao estágio.';
  end if;

  select ia.presentation_id
  into v_presentation_id
  from public.internships i
  join public.internship_authorizations ia
    on ia.id = i.authorization_id
  where i.id = p_internship_id;

  if v_presentation_id is null then
    raise exception 'Apresentação não localizada.';
  end if;

  return query
  select
    coalesce(
      (
        select sum(a.duration_minutes)::bigint
        from public.internship_attendance a
        where a.internship_id = p_internship_id
      ),
      0::bigint
    ),
    sp.required_workload::numeric
  from public.student_presentations sp
  where sp.id = v_presentation_id;

  if not found then
    raise exception 'Carga horária obrigatória não localizada.';
  end if;
end;
$$;

revoke all
on function public.get_unit_closure_workload(uuid)
from public, anon, authenticated;

grant execute
on function public.get_unit_closure_workload(uuid)
to authenticated;

-- Encerramento atômico: relatório + status do estágio.
create or replace function public.close_internship_with_attendance(
  p_internship_id uuid,
  p_performed_period text,
  p_activities_summary text,
  p_supervisor_notes text,
  p_closing_status text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_profile record;
  v_internship record;
  v_presentation record;
  v_minutes bigint;
  v_report_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select role, is_active, municipal_unit_id
  into v_profile
  from public.profiles
  where id = v_user_id;

  if not found
     or v_profile.is_active is distinct from true
     or v_profile.role is distinct from 'unidade'
     or v_profile.municipal_unit_id is null then
    raise exception 'Acesso permitido apenas à unidade municipal ativa.';
  end if;

  if p_closing_status is null
     or p_closing_status not in (
       'concluido',
       'concluido_com_observacao',
       'encerrado_antecipadamente'
     ) then
    raise exception 'Situação de encerramento inválida.';
  end if;

  if nullif(btrim(coalesce(p_performed_period, '')), '') is null then
    raise exception 'Informe o período efetivamente realizado.';
  end if;

  if nullif(btrim(coalesce(p_activities_summary, '')), '') is null then
    raise exception 'Informe o resumo das atividades.';
  end if;

  if p_closing_status = 'encerrado_antecipadamente'
     and nullif(btrim(coalesce(p_supervisor_notes, '')), '') is null then
    raise exception 'Justifique o encerramento antecipado.';
  end if;

  -- Bloqueia concorrência entre dois encerramentos.
  select
    i.id,
    i.student_id,
    i.municipal_unit_id,
    i.supervisor_name,
    i.status,
    ia.presentation_id
  into v_internship
  from public.internships i
  join public.internship_authorizations ia
    on ia.id = i.authorization_id
  where i.id = p_internship_id
  for update of i;

  if not found then
    raise exception 'Estágio ou autorização não encontrado.';
  end if;

  if v_internship.municipal_unit_id is distinct from
     v_profile.municipal_unit_id then
    raise exception 'Estágio não pertence à unidade.';
  end if;

  if v_internship.status not in ('em_andamento', 'suspenso') then
    raise exception 'O estágio não permite encerramento nesta situação.';
  end if;

  if exists (
    select 1
    from public.final_reports fr
    where fr.internship_id = p_internship_id
  ) then
    raise exception 'Já existe relatório final para este estágio.';
  end if;

  select student_id, required_workload
  into v_presentation
  from public.student_presentations
  where id = v_internship.presentation_id;

  if not found
     or v_presentation.student_id is distinct from
        v_internship.student_id
     or coalesce(v_presentation.required_workload, 0) <= 0 then
    raise exception 'Apresentação ou carga horária obrigatória inválida.';
  end if;

  select coalesce(sum(a.duration_minutes), 0)::bigint
  into v_minutes
  from public.internship_attendance a
  where a.internship_id = p_internship_id;

  if p_closing_status in (
    'concluido',
    'concluido_com_observacao'
  )
  and v_minutes::numeric <
      v_presentation.required_workload::numeric * 60 then

    raise exception
      'Carga horária insuficiente: % minuto(s) registrados de % hora(s) exigidas.',
      v_minutes,
      v_presentation.required_workload;
  end if;

  insert into public.final_reports (
    internship_id,
    student_id,
    municipal_unit_id,
    supervisor_name,
    performed_period,
    completed_workload,
    activities_summary,
    supervisor_notes,
    closing_status,
    created_by
  )
  values (
    v_internship.id,
    v_internship.student_id,
    v_internship.municipal_unit_id,
    v_internship.supervisor_name,
    btrim(p_performed_period),
    round(v_minutes::numeric / 60, 2),
    btrim(p_activities_summary),
    nullif(btrim(coalesce(p_supervisor_notes, '')), ''),
    p_closing_status,
    v_user_id
  )
  returning id into v_report_id;

  update public.internships
  set
    status = 'encerrado',
    updated_at = now()
  where id = p_internship_id;

  return v_report_id;
end;
$$;

revoke all
on function public.close_internship_with_attendance(
  uuid, text, text, text, text
)
from public, anon, authenticated;

grant execute
on function public.close_internship_with_attendance(
  uuid, text, text, text, text
)
to authenticated;

-- Encerramentos novos devem utilizar exclusivamente
-- a função transacional acima.
revoke insert, update, delete
on public.final_reports
from public, anon, authenticated;

commit;
