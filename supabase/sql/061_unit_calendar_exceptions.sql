-- Integra Estágio
-- Migration 061 - Calendário de exceções
-- Versão com inclusão posterior e abrangência municipal

begin;

create table if not exists public.unit_calendar_exceptions (
  id uuid primary key default gen_random_uuid(),
  municipal_unit_id uuid references public.municipal_units(id)
    on delete restrict,
  exception_type text not null,
  start_date date not null,
  end_date date not null,
  description text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Unidade nula significa abrangência municipal.
alter table public.unit_calendar_exceptions
  alter column municipal_unit_id drop not null;

alter table public.unit_calendar_exceptions
  drop constraint if exists unit_calendar_period_check;

alter table public.unit_calendar_exceptions
  add constraint unit_calendar_period_check
  check (end_date >= start_date);

alter table public.unit_calendar_exceptions
  drop constraint if exists unit_calendar_description_check;

alter table public.unit_calendar_exceptions
  add constraint unit_calendar_description_check
  check (length(btrim(description)) >= 5);

alter table public.unit_calendar_exceptions
  drop constraint if exists unit_calendar_exceptions_exception_type_check;

alter table public.unit_calendar_exceptions
  add constraint unit_calendar_exceptions_exception_type_check
  check (
    exception_type in (
      'feriado',
      'ponto_facultativo',
      'recesso',
      'suspensao_atividades',
      'dispensa_coletiva'
    )
  );

create index if not exists idx_unit_calendar_unit_dates
  on public.unit_calendar_exceptions
  (municipal_unit_id, start_date, end_date);

-- Validação do cadastro administrativo.
-- Não impede o cadastro posterior à data prevista.
-- Não altera nem apaga frequências existentes.

create or replace function public.validate_unit_calendar_exception()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin', 'coordenadoria')
  ) then
    raise exception 'Cadastro permitido apenas à Coordenadoria.';
  end if;

  if exists (
    select 1
    from public.unit_calendar_exceptions e
    where e.id is distinct from new.id
      and (
        e.municipal_unit_id is null
        or new.municipal_unit_id is null
        or e.municipal_unit_id = new.municipal_unit_id
      )
      and e.start_date <= new.end_date
      and e.end_date >= new.start_date
  ) then
    raise exception
      'Já existe exceção abrangendo este período e unidade.';
  end if;

  new.created_by := auth.uid();
  new.created_at := now();

  return new;
end;
$$;

drop trigger if exists validate_unit_calendar_exception_trigger
  on public.unit_calendar_exceptions;

create trigger validate_unit_calendar_exception_trigger
before insert on public.unit_calendar_exceptions
for each row
execute function public.validate_unit_calendar_exception();

-- Impede NOVOS lançamentos em dias dispensados.
-- Correções de frequências anteriores continuam possíveis
-- e continuam sendo auditadas.

create or replace function public.attendance_check_calendar_exception()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_description text;
begin
  select e.description
  into v_description
  from public.unit_calendar_exceptions e
  where (
    e.municipal_unit_id is null
    or e.municipal_unit_id = new.municipal_unit_id
  )
    and new.attendance_date between e.start_date and e.end_date
  order by e.created_at desc
  limit 1;

  if found then
    raise exception
      'Data dispensada de atividades: %.',
      v_description;
  end if;

  return new;
end;
$$;

drop trigger if exists attendance_check_calendar_exception_trigger
  on public.internship_attendance;

create trigger attendance_check_calendar_exception_trigger
before insert on public.internship_attendance
for each row
execute function public.attendance_check_calendar_exception();

alter table public.unit_calendar_exceptions
  enable row level security;

drop policy if exists unit_calendar_select
  on public.unit_calendar_exceptions;

create policy unit_calendar_select
on public.unit_calendar_exceptions
for select to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id is null
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

drop policy if exists unit_calendar_insert
  on public.unit_calendar_exceptions;

create policy unit_calendar_insert
on public.unit_calendar_exceptions
for insert to authenticated
with check (public.is_admin_or_coordenadoria());

grant select, insert
  on public.unit_calendar_exceptions to authenticated;

revoke update, delete, truncate
  on public.unit_calendar_exceptions
  from public, anon, authenticated;

revoke all
  on function public.validate_unit_calendar_exception()
  from public, anon, authenticated;

revoke all
  on function public.attendance_check_calendar_exception()
  from public, anon, authenticated;

commit;
