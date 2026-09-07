-- Integra Estágio
-- 039_create_internship_occurrences.sql
-- Cria registros de ocorrências para acompanhamento do estágio pela unidade municipal.

create table if not exists public.internship_occurrences (
  id uuid primary key default gen_random_uuid(),

  authorization_id uuid not null references public.internship_authorizations(id) on delete cascade,
  student_id uuid not null references public.students(id),
  institution_id uuid not null references public.institutions(id),
  course_id uuid not null references public.courses(id),
  municipal_unit_id uuid not null references public.municipal_units(id),

  occurrence_type text not null,
  occurrence_date date not null default current_date,
  description text not null,

  status text not null default 'pendente',
  resolution_notes text,

  reported_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internship_occurrences_type_check check (
    occurrence_type in (
      'falta',
      'atraso',
      'ajuste_horario',
      'alteracao_supervisor',
      'dificuldade_acompanhamento',
      'encerramento_antecipado',
      'outra'
    )
  ),

  constraint internship_occurrences_status_check check (
    status in (
      'pendente',
      'em_acompanhamento',
      'resolvida',
      'critica',
      'cancelada'
    )
  )
);

create index if not exists internship_occurrences_authorization_id_idx
on public.internship_occurrences(authorization_id);

create index if not exists internship_occurrences_municipal_unit_id_idx
on public.internship_occurrences(municipal_unit_id);

create index if not exists internship_occurrences_status_idx
on public.internship_occurrences(status);

alter table public.internship_occurrences enable row level security;

grant select, insert, update on table public.internship_occurrences to authenticated;

drop policy if exists "internship_occurrences_select_allowed"
on public.internship_occurrences;

create policy "internship_occurrences_select_allowed"
on public.internship_occurrences
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

drop policy if exists "internship_occurrences_insert_unit_own"
on public.internship_occurrences;

create policy "internship_occurrences_insert_unit_own"
on public.internship_occurrences
for insert
to authenticated
with check (
  municipal_unit_id = public.current_profile_municipal_unit_id()
);

drop policy if exists "internship_occurrences_update_allowed"
on public.internship_occurrences;

create policy "internship_occurrences_update_allowed"
on public.internship_occurrences
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
