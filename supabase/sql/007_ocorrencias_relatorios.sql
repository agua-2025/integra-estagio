-- Integra Estágio
-- 007_ocorrencias_relatorios.sql
-- Tabelas e políticas para ocorrências e relatórios finais.

-- =========================================================
-- Tabela: occurrences
-- =========================================================

create table if not exists public.occurrences (
  id uuid primary key default gen_random_uuid(),

  internship_id uuid not null references public.internships(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  occurrence_type text not null,
  occurred_at date not null,
  description text not null,
  measures_taken text,

  status text not null default 'registrada',

  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint occurrences_type_check check (
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

  constraint occurrences_status_check check (
    status in (
      'registrada',
      'em_acompanhamento',
      'resolvida',
      'critica',
      'cancelada'
    )
  ),

  constraint occurrences_description_check check (
    length(trim(description)) > 0
  )
);

create trigger set_occurrences_updated_at
before update on public.occurrences
for each row
execute function public.set_updated_at();

-- =========================================================
-- Tabela: final_reports
-- =========================================================

create table if not exists public.final_reports (
  id uuid primary key default gen_random_uuid(),

  internship_id uuid not null references public.internships(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  supervisor_name text,
  performed_period text,
  completed_workload integer,
  activities_summary text,
  supervisor_notes text,

  closing_status text not null default 'pendente',

  created_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint final_reports_completed_workload_check check (
    completed_workload is null or completed_workload >= 0
  ),

  constraint final_reports_closing_status_check check (
    closing_status in (
      'concluido',
      'concluido_com_observacao',
      'encerrado_antecipadamente',
      'pendente',
      'cancelado'
    )
  ),

  constraint final_reports_internship_unique unique (internship_id)
);

create trigger set_final_reports_updated_at
before update on public.final_reports
for each row
execute function public.set_updated_at();

-- =========================================================
-- Função: validar ocorrência vinculada ao estágio
-- =========================================================

create or replace function public.validate_occurrence_internship()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  internship_record record;
begin
  select
    i.id,
    i.student_id,
    i.municipal_unit_id
  into internship_record
  from public.internships i
  where i.id = new.internship_id;

  if internship_record.id is null then
    raise exception 'Estágio não encontrado.';
  end if;

  if internship_record.student_id <> new.student_id then
    raise exception 'O estudante da ocorrência não corresponde ao estágio.';
  end if;

  if internship_record.municipal_unit_id <> new.municipal_unit_id then
    raise exception 'A unidade da ocorrência não corresponde ao estágio.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_occurrence_internship_trigger on public.occurrences;

create trigger validate_occurrence_internship_trigger
before insert or update of internship_id, student_id, municipal_unit_id
on public.occurrences
for each row
execute function public.validate_occurrence_internship();

-- =========================================================
-- Função: validar relatório final vinculado ao estágio
-- =========================================================

create or replace function public.validate_final_report_internship()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  internship_record record;
begin
  select
    i.id,
    i.student_id,
    i.municipal_unit_id,
    i.supervisor_name
  into internship_record
  from public.internships i
  where i.id = new.internship_id;

  if internship_record.id is null then
    raise exception 'Estágio não encontrado.';
  end if;

  if internship_record.student_id <> new.student_id then
    raise exception 'O estudante do relatório final não corresponde ao estágio.';
  end if;

  if internship_record.municipal_unit_id <> new.municipal_unit_id then
    raise exception 'A unidade do relatório final não corresponde ao estágio.';
  end if;

  if new.supervisor_name is null then
    new.supervisor_name = internship_record.supervisor_name;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_final_report_internship_trigger on public.final_reports;

create trigger validate_final_report_internship_trigger
before insert or update of internship_id, student_id, municipal_unit_id
on public.final_reports
for each row
execute function public.validate_final_report_internship();

-- =========================================================
-- Índices
-- =========================================================

create index if not exists idx_occurrences_internship_id
on public.occurrences(internship_id);

create index if not exists idx_occurrences_student_id
on public.occurrences(student_id);

create index if not exists idx_occurrences_unit_id
on public.occurrences(municipal_unit_id);

create index if not exists idx_occurrences_type
on public.occurrences(occurrence_type);

create index if not exists idx_occurrences_status
on public.occurrences(status);

create index if not exists idx_occurrences_occurred_at
on public.occurrences(occurred_at);

create index if not exists idx_final_reports_internship_id
on public.final_reports(internship_id);

create index if not exists idx_final_reports_student_id
on public.final_reports(student_id);

create index if not exists idx_final_reports_unit_id
on public.final_reports(municipal_unit_id);

create index if not exists idx_final_reports_closing_status
on public.final_reports(closing_status);

-- =========================================================
-- RLS
-- =========================================================

alter table public.occurrences enable row level security;
alter table public.final_reports enable row level security;

drop policy if exists "occurrences_select_policy" on public.occurrences;
drop policy if exists "occurrences_insert_policy" on public.occurrences;
drop policy if exists "occurrences_update_policy" on public.occurrences;
drop policy if exists "occurrences_delete_policy" on public.occurrences;

drop policy if exists "final_reports_select_policy" on public.final_reports;
drop policy if exists "final_reports_insert_policy" on public.final_reports;
drop policy if exists "final_reports_update_policy" on public.final_reports;
drop policy if exists "final_reports_delete_policy" on public.final_reports;

-- =========================================================
-- Políticas RLS: occurrences
-- =========================================================

create policy "occurrences_select_policy"
on public.occurrences
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or student_id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
  or exists (
    select 1
    from public.internships i
    where i.id = occurrences.internship_id
      and i.institution_id = public.current_profile_institution_id()
  )
);

create policy "occurrences_insert_policy"
on public.occurrences
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "occurrences_update_policy"
on public.occurrences
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

create policy "occurrences_delete_policy"
on public.occurrences
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: final_reports
-- =========================================================

create policy "final_reports_select_policy"
on public.final_reports
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or student_id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
  or exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.institution_id = public.current_profile_institution_id()
  )
);

create policy "final_reports_insert_policy"
on public.final_reports
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "final_reports_update_policy"
on public.final_reports
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

create policy "final_reports_delete_policy"
on public.final_reports
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
