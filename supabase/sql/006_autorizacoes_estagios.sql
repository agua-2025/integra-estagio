-- Integra Estágio
-- 006_autorizacoes_estagios.sql
-- Tabelas e políticas para autorizações de início e estágios autorizados.

-- =========================================================
-- Ajuste complementar: vincular profiles.student_id à tabela students
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'profiles_student_id_fkey'
      and table_schema = 'public'
      and table_name = 'profiles'
  ) then
    alter table public.profiles
    add constraint profiles_student_id_fkey
    foreign key (student_id)
    references public.students(id)
    on delete set null;
  end if;
end;
$$;

-- =========================================================
-- Tabela: internship_authorizations
-- =========================================================

create table if not exists public.internship_authorizations (
  id uuid primary key default gen_random_uuid(),

  presentation_id uuid not null references public.student_presentations(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  agreement_id uuid not null references public.cooperation_agreements(id) on delete restrict,
  field_id uuid references public.internship_fields(id) on delete set null,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  supervisor_name text not null,
  authorized_start_date date not null,
  authorized_end_date date,
  authorized_schedule text,

  status text not null default 'pronto_para_autorizar',

  authorized_by uuid references public.profiles(id) on delete set null,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internship_authorizations_dates_check check (
    authorized_end_date is null
    or authorized_end_date >= authorized_start_date
  ),

  constraint internship_authorizations_supervisor_check check (
    length(trim(supervisor_name)) > 0
  ),

  constraint internship_authorizations_status_check check (
    status in (
      'aguardando_unidade',
      'aguardando_supervisor',
      'pronto_para_autorizar',
      'autorizado',
      'suspenso',
      'cancelado',
      'encerrado'
    )
  )
);

create trigger set_internship_authorizations_updated_at
before update on public.internship_authorizations
for each row
execute function public.set_updated_at();

-- =========================================================
-- Tabela: internships
-- =========================================================

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),

  authorization_id uuid not null references public.internship_authorizations(id) on delete restrict,

  student_id uuid not null references public.students(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  supervisor_name text not null,
  start_date date not null,
  end_date date,
  schedule text,

  status text not null default 'aguardando_inicio',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internships_dates_check check (
    end_date is null
    or end_date >= start_date
  ),

  constraint internships_supervisor_check check (
    length(trim(supervisor_name)) > 0
  ),

  constraint internships_status_check check (
    status in (
      'aguardando_inicio',
      'em_andamento',
      'suspenso',
      'encerrado',
      'cancelado'
    )
  ),

  constraint internships_authorization_unique unique (authorization_id)
);

create trigger set_internships_updated_at
before update on public.internships
for each row
execute function public.set_updated_at();

-- =========================================================
-- Função: validar autorização de início
-- =========================================================

create or replace function public.validate_internship_authorization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  presentation_record record;
  agreement_record record;
begin
  select
    sp.id,
    sp.student_id,
    sp.institution_id,
    sp.course_id,
    sp.agreement_id,
    sp.field_id,
    sp.municipal_unit_id,
    sp.status
  into presentation_record
  from public.student_presentations sp
  where sp.id = new.presentation_id;

  if presentation_record.id is null then
    raise exception 'Apresentação do estudante não encontrada.';
  end if;

  if presentation_record.status not in ('documentos_validados', 'apto_para_autorizacao', 'autorizado') then
    raise exception 'A autorização exige apresentação com documentos validados ou apta para autorização.';
  end if;

  if presentation_record.student_id <> new.student_id then
    raise exception 'O estudante da autorização não corresponde à apresentação.';
  end if;

  if presentation_record.institution_id <> new.institution_id then
    raise exception 'A instituição da autorização não corresponde à apresentação.';
  end if;

  if presentation_record.course_id <> new.course_id then
    raise exception 'O curso da autorização não corresponde à apresentação.';
  end if;

  if presentation_record.agreement_id <> new.agreement_id then
    raise exception 'O acordo da autorização não corresponde à apresentação.';
  end if;

  if new.municipal_unit_id is null then
    raise exception 'A autorização exige unidade municipal definida.';
  end if;

  if new.supervisor_name is null or length(trim(new.supervisor_name)) = 0 then
    raise exception 'A autorização exige supervisor indicado.';
  end if;

  select
    a.id,
    a.status,
    a.signed_at,
    a.published_at,
    a.started_at,
    a.ended_at
  into agreement_record
  from public.cooperation_agreements a
  where a.id = new.agreement_id;

  if agreement_record.id is null then
    raise exception 'Acordo de Cooperação não encontrado.';
  end if;

  if agreement_record.status <> 'ativo' then
    raise exception 'A autorização exige Acordo de Cooperação ativo.';
  end if;

  if agreement_record.signed_at is null then
    raise exception 'A autorização exige acordo assinado.';
  end if;

  if agreement_record.published_at is null then
    raise exception 'A autorização exige acordo publicado.';
  end if;

  if agreement_record.started_at is not null and agreement_record.started_at > current_date then
    raise exception 'O acordo ainda não está vigente.';
  end if;

  if agreement_record.ended_at is not null and agreement_record.ended_at < current_date then
    raise exception 'O acordo está vencido.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_internship_authorization_trigger on public.internship_authorizations;

create trigger validate_internship_authorization_trigger
before insert or update of presentation_id, student_id, institution_id, course_id, agreement_id, municipal_unit_id, supervisor_name
on public.internship_authorizations
for each row
execute function public.validate_internship_authorization();

-- =========================================================
-- Função: validar estágio autorizado
-- =========================================================

create or replace function public.validate_internship_from_authorization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  authorization_record record;
begin
  select
    ia.id,
    ia.student_id,
    ia.institution_id,
    ia.course_id,
    ia.municipal_unit_id,
    ia.supervisor_name,
    ia.authorized_start_date,
    ia.authorized_end_date,
    ia.authorized_schedule,
    ia.status
  into authorization_record
  from public.internship_authorizations ia
  where ia.id = new.authorization_id;

  if authorization_record.id is null then
    raise exception 'Autorização de início não encontrada.';
  end if;

  if authorization_record.status <> 'autorizado' then
    raise exception 'O estágio somente pode ser criado a partir de autorização com status autorizado.';
  end if;

  if authorization_record.student_id <> new.student_id then
    raise exception 'O estudante do estágio não corresponde à autorização.';
  end if;

  if authorization_record.institution_id <> new.institution_id then
    raise exception 'A instituição do estágio não corresponde à autorização.';
  end if;

  if authorization_record.course_id <> new.course_id then
    raise exception 'O curso do estágio não corresponde à autorização.';
  end if;

  if authorization_record.municipal_unit_id <> new.municipal_unit_id then
    raise exception 'A unidade do estágio não corresponde à autorização.';
  end if;

  if new.supervisor_name is null or length(trim(new.supervisor_name)) = 0 then
    raise exception 'O estágio exige supervisor indicado.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_internship_from_authorization_trigger on public.internships;

create trigger validate_internship_from_authorization_trigger
before insert or update of authorization_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name
on public.internships
for each row
execute function public.validate_internship_from_authorization();

-- =========================================================
-- Índices
-- =========================================================

create index if not exists idx_internship_authorizations_presentation_id
on public.internship_authorizations(presentation_id);

create index if not exists idx_internship_authorizations_student_id
on public.internship_authorizations(student_id);

create index if not exists idx_internship_authorizations_institution_id
on public.internship_authorizations(institution_id);

create index if not exists idx_internship_authorizations_course_id
on public.internship_authorizations(course_id);

create index if not exists idx_internship_authorizations_agreement_id
on public.internship_authorizations(agreement_id);

create index if not exists idx_internship_authorizations_unit_id
on public.internship_authorizations(municipal_unit_id);

create index if not exists idx_internship_authorizations_status
on public.internship_authorizations(status);

create index if not exists idx_internships_authorization_id
on public.internships(authorization_id);

create index if not exists idx_internships_student_id
on public.internships(student_id);

create index if not exists idx_internships_institution_id
on public.internships(institution_id);

create index if not exists idx_internships_course_id
on public.internships(course_id);

create index if not exists idx_internships_unit_id
on public.internships(municipal_unit_id);

create index if not exists idx_internships_status
on public.internships(status);

-- =========================================================
-- RLS
-- =========================================================

alter table public.internship_authorizations enable row level security;
alter table public.internships enable row level security;

drop policy if exists "internship_authorizations_select_policy" on public.internship_authorizations;
drop policy if exists "internship_authorizations_insert_policy" on public.internship_authorizations;
drop policy if exists "internship_authorizations_update_policy" on public.internship_authorizations;
drop policy if exists "internship_authorizations_delete_policy" on public.internship_authorizations;

drop policy if exists "internships_select_policy" on public.internships;
drop policy if exists "internships_insert_policy" on public.internships;
drop policy if exists "internships_update_policy" on public.internships;
drop policy if exists "internships_delete_policy" on public.internships;

-- =========================================================
-- Políticas RLS: internship_authorizations
-- =========================================================

create policy "internship_authorizations_select_policy"
on public.internship_authorizations
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or student_id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
);

create policy "internship_authorizations_insert_policy"
on public.internship_authorizations
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "internship_authorizations_update_policy"
on public.internship_authorizations
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "internship_authorizations_delete_policy"
on public.internship_authorizations
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: internships
-- =========================================================

create policy "internships_select_policy"
on public.internships
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or student_id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
);

create policy "internships_insert_policy"
on public.internships
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "internships_update_policy"
on public.internships
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
)
with check (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "internships_delete_policy"
on public.internships
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
