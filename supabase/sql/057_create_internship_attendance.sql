-- Integra Estágio - Migration 057
-- Frequência registrada pela unidade, sem homologação individual.
-- A aplicação do relatório final será integrada em migration posterior.

begin;

create table if not exists public.internship_attendance (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,
  attendance_date date not null,
  attendance_status text not null,
  start_time time without time zone,
  end_time time without time zone,
  break_minutes integer not null default 0,
  duration_minutes integer not null default 0,
  notes text,
  correction_reason text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internship_attendance_unique_day unique (internship_id, attendance_date),
  constraint internship_attendance_status_check check (
    attendance_status in ('presenca', 'presenca_parcial', 'falta', 'falta_justificada')
  ),
  constraint internship_attendance_break_check check (break_minutes >= 0),
  constraint internship_attendance_duration_check check (duration_minutes >= 0)
);

create table if not exists public.internship_attendance_history (
  id bigint generated always as identity primary key,
  attendance_id uuid not null,
  internship_id uuid not null,
  municipal_unit_id uuid not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  correction_reason text not null,
  previous_record jsonb not null,
  new_record jsonb not null
);

create index if not exists idx_attendance_unit_date
  on public.internship_attendance (municipal_unit_id, attendance_date desc);
create index if not exists idx_attendance_internship_date
  on public.internship_attendance (internship_id, attendance_date);
create index if not exists idx_attendance_history_attendance
  on public.internship_attendance_history (attendance_id, changed_at desc);

create or replace function public.validate_internship_attendance()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_internship record;
  v_minutes integer;
begin
  select id, municipal_unit_id, start_date, end_date, status
    into v_internship
    from public.internships
   where id = new.internship_id;

  if not found then
    raise exception 'Estágio não encontrado.';
  end if;

  if new.municipal_unit_id is distinct from v_internship.municipal_unit_id then
    raise exception 'Unidade municipal diferente da unidade responsável pelo estágio.';
  end if;

  if v_internship.status <> 'em_andamento' then
    raise exception 'A frequência somente pode ser registrada em estágio em andamento.';
  end if;

  if new.attendance_date > (now() at time zone 'America/Cuiaba')::date then
    raise exception 'Não é permitido registrar frequência em data futura.';
  end if;

  if new.attendance_date < v_internship.start_date
     or (v_internship.end_date is not null and new.attendance_date > v_internship.end_date) then
    raise exception 'A data está fora do período do estágio.';
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
       or new.internship_id is distinct from old.internship_id
       or new.municipal_unit_id is distinct from old.municipal_unit_id
       or new.attendance_date is distinct from old.attendance_date
       or new.created_at is distinct from old.created_at
       or new.created_by is distinct from old.created_by then
      raise exception 'Identificação, data e autoria do lançamento não podem ser alteradas. Corrija o lançamento na mesma data.';
    end if;

    if nullif(btrim(coalesce(new.correction_reason, '')), '') is null
       or new.correction_reason is not distinct from old.correction_reason then
      raise exception 'Informe uma nova justificativa para corrigir a frequência.';
    end if;
  else
    new.correction_reason := null;
    new.created_by := auth.uid();
  end if;

  if new.attendance_status in ('falta', 'falta_justificada') then
    if new.start_time is not null or new.end_time is not null or new.break_minutes <> 0 then
      raise exception 'Faltas não podem conter horários ou intervalo.';
    end if;
    new.duration_minutes := 0;
  else
    if new.start_time is null or new.end_time is null then
      raise exception 'Informe entrada e saída para registrar presença.';
    end if;
    if new.end_time <= new.start_time then
      raise exception 'A saída deve ser posterior à entrada.';
    end if;
    v_minutes := (extract(epoch from (new.end_time - new.start_time)) / 60)::integer;
    if new.break_minutes >= v_minutes then
      raise exception 'O intervalo deve ser menor que a permanência.';
    end if;
    new.duration_minutes := v_minutes - new.break_minutes;
    if new.duration_minutes <= 0 or new.duration_minutes > 360 then
      raise exception 'A frequência deve ter mais de zero e no máximo seis horas efetivas por dia.';
    end if;
  end if;

  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists validate_internship_attendance_trigger on public.internship_attendance;
create trigger validate_internship_attendance_trigger
before insert or update on public.internship_attendance
for each row execute function public.validate_internship_attendance();

create or replace function public.audit_internship_attendance()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.internship_attendance_history (
    attendance_id, internship_id, municipal_unit_id, changed_by,
    correction_reason, previous_record, new_record
  ) values (
    new.id, new.internship_id, new.municipal_unit_id, auth.uid(),
    new.correction_reason, to_jsonb(old), to_jsonb(new)
  );
  return new;
end;
$$;

drop trigger if exists audit_internship_attendance_trigger on public.internship_attendance;
create trigger audit_internship_attendance_trigger
after update on public.internship_attendance
for each row execute function public.audit_internship_attendance();

alter table public.internship_attendance enable row level security;
alter table public.internship_attendance_history enable row level security;

create policy attendance_select on public.internship_attendance
for select to authenticated using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or exists (
    select 1 from public.internships i
    join public.profiles p on p.student_id = i.student_id
    where i.id = internship_attendance.internship_id
      and p.id = auth.uid() and p.is_active = true and p.role = 'estagiario'
  )
);

create policy attendance_insert on public.internship_attendance
for insert to authenticated with check (
  municipal_unit_id = public.current_profile_municipal_unit_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true and p.role = 'unidade'
  )
);

create policy attendance_update on public.internship_attendance
for update to authenticated
using (
  municipal_unit_id = public.current_profile_municipal_unit_id()
  and exists (select 1 from public.profiles p
              where p.id = auth.uid() and p.is_active = true and p.role = 'unidade')
)
with check (
  municipal_unit_id = public.current_profile_municipal_unit_id()
  and exists (select 1 from public.profiles p
              where p.id = auth.uid() and p.is_active = true and p.role = 'unidade')
);

create policy attendance_history_select on public.internship_attendance_history
for select to authenticated using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or exists (
    select 1 from public.internships i
    join public.profiles p on p.student_id = i.student_id
    where i.id = internship_attendance_history.internship_id
      and p.id = auth.uid() and p.is_active = true and p.role = 'estagiario'
  )
);

-- Não há políticas de DELETE ou de escrita direta no histórico.
grant select, insert, update on public.internship_attendance to authenticated;
grant select on public.internship_attendance_history to authenticated;

commit;
