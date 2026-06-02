-- Integra Estágio
-- 001_base_inicial.sql
-- Base inicial: perfis, instituições, contatos, cursos, unidades, campos de estágio e vínculos.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  address text,
  city text,
  state text,
  phone text,
  email text,
  status text not null default 'em_analise',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint institutions_status_check check (
    status in ('em_analise', 'ativa', 'pendente', 'inativa', 'bloqueada')
  )
);

create trigger set_institutions_updated_at
before update on public.institutions
for each row
execute function public.set_updated_at();

create table if not exists public.municipal_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  address text,
  responsible_name text,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_municipal_units_updated_at
before update on public.municipal_units
for each row
execute function public.set_updated_at();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null,
  institution_id uuid references public.institutions(id) on delete set null,
  municipal_unit_id uuid references public.municipal_units(id) on delete set null,
  student_id uuid null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_role_check check (
    role in ('admin', 'coordenadoria', 'instituicao', 'unidade', 'estagiario')
  )
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.institution_contacts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  position text,
  email text,
  phone text,
  is_legal_representative boolean not null default false,
  is_internship_responsible boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_institution_contacts_updated_at
before update on public.institution_contacts
for each row
execute function public.set_updated_at();

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  level text,
  workload_required integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint courses_level_check check (
    level is null or level in ('superior', 'tecnico', 'medio', 'outro')
  )
);

create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

create table if not exists public.internship_fields (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  area text,
  municipal_unit_id uuid references public.municipal_units(id) on delete set null,
  status text not null default 'em_analise',
  is_public boolean not null default false,
  available_slots integer,
  shift text,
  supervisor_required boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internship_fields_status_check check (
    status in ('ativo', 'em_analise', 'temporariamente_indisponivel', 'inativo')
  )
);

create trigger set_internship_fields_updated_at
before update on public.internship_fields
for each row
execute function public.set_updated_at();

create table if not exists public.field_courses (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.internship_fields(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint field_courses_unique unique (field_id, course_id)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_institution_id on public.profiles(institution_id);
create index if not exists idx_profiles_municipal_unit_id on public.profiles(municipal_unit_id);

create index if not exists idx_institutions_status on public.institutions(status);
create index if not exists idx_courses_institution_id on public.courses(institution_id);
create index if not exists idx_institution_contacts_institution_id on public.institution_contacts(institution_id);

create index if not exists idx_internship_fields_status on public.internship_fields(status);
create index if not exists idx_internship_fields_is_public on public.internship_fields(is_public);
create index if not exists idx_internship_fields_municipal_unit_id on public.internship_fields(municipal_unit_id);

create index if not exists idx_field_courses_field_id on public.field_courses(field_id);
create index if not exists idx_field_courses_course_id on public.field_courses(course_id);

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_contacts enable row level security;
alter table public.courses enable row level security;
alter table public.municipal_units enable row level security;
alter table public.internship_fields enable row level security;
alter table public.field_courses enable row level security;

-- Políticas serão criadas na próxima etapa, após conferência das tabelas.
