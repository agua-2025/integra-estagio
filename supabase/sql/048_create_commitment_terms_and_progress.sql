-- =========================================================
-- Termo de Compromisso e evolução do estágio
-- =========================================================

create table if not exists public.commitment_terms (
  id uuid primary key default gen_random_uuid(),

  presentation_id uuid not null references public.student_presentations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  agreement_id uuid not null references public.cooperation_agreements(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  term_document_id uuid references public.student_documents(id) on delete set null,
  insurance_document_id uuid references public.student_documents(id) on delete set null,

  status text not null default 'rascunho',

  policy_number text,
  insurance_company text,
  insurance_valid_from date,
  insurance_valid_until date,

  internship_start_date date,
  internship_end_date date,
  internship_schedule text,
  required_workload numeric(8,2),

  supervisor_name text,
  notes text,

  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,

  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commitment_terms_status_check check (
    status in (
      'rascunho',
      'enviado',
      'em_analise',
      'pendente_correcao',
      'validado',
      'rejeitado',
      'substituido',
      'cancelado'
    )
  ),

  constraint commitment_terms_insurance_period_check check (
    insurance_valid_from is null
    or insurance_valid_until is null
    or insurance_valid_until >= insurance_valid_from
  ),

  constraint commitment_terms_internship_period_check check (
    internship_start_date is null
    or internship_end_date is null
    or internship_end_date >= internship_start_date
  ),

  constraint commitment_terms_required_workload_check check (
    required_workload is null
    or required_workload > 0
  )
);

create unique index if not exists commitment_terms_presentation_active_unique_idx
on public.commitment_terms(presentation_id)
where status not in ('substituido', 'cancelado');

create index if not exists idx_commitment_terms_presentation_id
on public.commitment_terms(presentation_id);

create index if not exists idx_commitment_terms_student_id
on public.commitment_terms(student_id);

create index if not exists idx_commitment_terms_status
on public.commitment_terms(status);

create index if not exists idx_commitment_terms_insurance_valid_until
on public.commitment_terms(insurance_valid_until);

create trigger set_commitment_terms_updated_at
before update on public.commitment_terms
for each row
execute function public.set_updated_at();

-- =========================================================
-- Validação de integridade do Termo de Compromisso
-- =========================================================

create or replace function public.validate_commitment_term_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  presentation_record record;
  term_document_record record;
  insurance_document_record record;
begin
  select
    sp.id,
    sp.student_id,
    sp.institution_id,
    sp.course_id,
    sp.agreement_id,
    sp.municipal_unit_id,
    sp.required_workload
  into presentation_record
  from public.student_presentations sp
  where sp.id = new.presentation_id;

  if presentation_record.id is null then
    raise exception 'Apresentação do estagiário não encontrada.';
  end if;

  if presentation_record.student_id <> new.student_id then
    raise exception 'O termo não corresponde ao estagiário da apresentação.';
  end if;

  if presentation_record.institution_id <> new.institution_id then
    raise exception 'O termo não corresponde à instituição da apresentação.';
  end if;

  if presentation_record.course_id <> new.course_id then
    raise exception 'O termo não corresponde ao curso da apresentação.';
  end if;

  if presentation_record.agreement_id <> new.agreement_id then
    raise exception 'O termo não corresponde ao acordo da apresentação.';
  end if;

  if presentation_record.municipal_unit_id is not null
     and presentation_record.municipal_unit_id <> new.municipal_unit_id then
    raise exception 'O termo não corresponde à unidade municipal da apresentação.';
  end if;

  if new.required_workload is not null
     and presentation_record.required_workload is not null
     and new.required_workload <> presentation_record.required_workload then
    raise exception 'A carga horária do termo deve corresponder à carga horária da apresentação.';
  end if;

  if new.term_document_id is not null then
    select id, presentation_id, document_type
    into term_document_record
    from public.student_documents
    where id = new.term_document_id;

    if term_document_record.id is null then
      raise exception 'Documento do termo de compromisso não encontrado.';
    end if;

    if term_document_record.presentation_id <> new.presentation_id then
      raise exception 'O documento do termo não pertence à apresentação informada.';
    end if;

    if term_document_record.document_type <> 'termo_compromisso' then
      raise exception 'O documento vinculado como termo deve ser do tipo termo_compromisso.';
    end if;
  end if;

  if new.insurance_document_id is not null then
    select id, presentation_id, document_type
    into insurance_document_record
    from public.student_documents
    where id = new.insurance_document_id;

    if insurance_document_record.id is null then
      raise exception 'Documento da apólice/seguro não encontrado.';
    end if;

    if insurance_document_record.presentation_id <> new.presentation_id then
      raise exception 'O documento da apólice/seguro não pertence à apresentação informada.';
    end if;

    if insurance_document_record.document_type <> 'seguro' then
      raise exception 'O documento vinculado como apólice deve ser do tipo seguro.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_commitment_term_integrity_trigger
on public.commitment_terms;

create trigger validate_commitment_term_integrity_trigger
before insert or update of
  presentation_id,
  student_id,
  institution_id,
  course_id,
  agreement_id,
  municipal_unit_id,
  term_document_id,
  insurance_document_id,
  required_workload
on public.commitment_terms
for each row
execute function public.validate_commitment_term_integrity();

-- =========================================================
-- Evolução / carga horária do estágio
-- =========================================================

create table if not exists public.internship_progress_records (
  id uuid primary key default gen_random_uuid(),

  internship_id uuid not null references public.internships(id) on delete cascade,
  authorization_id uuid references public.internship_authorizations(id) on delete set null,
  student_id uuid not null references public.students(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  record_date date not null,
  worked_hours numeric(6,2) not null,
  activity_description text not null,
  notes text,

  status text not null default 'registrado',

  registered_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internship_progress_worked_hours_check check (
    worked_hours > 0
    and worked_hours <= 24
  ),

  constraint internship_progress_status_check check (
    status in (
      'registrado',
      'em_conferencia',
      'validado',
      'desconsiderado',
      'cancelado'
    )
  )
);

create index if not exists idx_internship_progress_internship_id
on public.internship_progress_records(internship_id);

create index if not exists idx_internship_progress_student_id
on public.internship_progress_records(student_id);

create index if not exists idx_internship_progress_unit_id
on public.internship_progress_records(municipal_unit_id);

create index if not exists idx_internship_progress_record_date
on public.internship_progress_records(record_date);

create trigger set_internship_progress_records_updated_at
before update on public.internship_progress_records
for each row
execute function public.set_updated_at();

-- =========================================================
-- Validação de integridade da evolução/carga horária
-- =========================================================

create or replace function public.validate_internship_progress_integrity()
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
    i.authorization_id,
    i.student_id,
    i.institution_id,
    i.course_id,
    i.municipal_unit_id,
    i.start_date,
    i.end_date
  into internship_record
  from public.internships i
  where i.id = new.internship_id;

  if internship_record.id is null then
    raise exception 'Estágio não encontrado.';
  end if;

  if internship_record.student_id <> new.student_id then
    raise exception 'O registro de evolução não corresponde ao estagiário do estágio.';
  end if;

  if internship_record.institution_id <> new.institution_id then
    raise exception 'O registro de evolução não corresponde à instituição do estágio.';
  end if;

  if internship_record.course_id <> new.course_id then
    raise exception 'O registro de evolução não corresponde ao curso do estágio.';
  end if;

  if internship_record.municipal_unit_id <> new.municipal_unit_id then
    raise exception 'O registro de evolução não corresponde à unidade do estágio.';
  end if;

  if new.authorization_id is not null
     and internship_record.authorization_id <> new.authorization_id then
    raise exception 'O registro de evolução não corresponde à autorização do estágio.';
  end if;

  if new.record_date < internship_record.start_date then
    raise exception 'A data da evolução não pode ser anterior ao início do estágio.';
  end if;

  if internship_record.end_date is not null
     and new.record_date > internship_record.end_date then
    raise exception 'A data da evolução não pode ser posterior ao término previsto do estágio.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_internship_progress_integrity_trigger
on public.internship_progress_records;

create trigger validate_internship_progress_integrity_trigger
before insert or update of
  internship_id,
  authorization_id,
  student_id,
  institution_id,
  course_id,
  municipal_unit_id,
  record_date
on public.internship_progress_records
for each row
execute function public.validate_internship_progress_integrity();

-- =========================================================
-- RLS e permissões
-- =========================================================

alter table public.commitment_terms enable row level security;
alter table public.internship_progress_records enable row level security;

grant select, insert, update, delete on public.commitment_terms to authenticated;
grant select, insert, update, delete on public.internship_progress_records to authenticated;

drop policy if exists "commitment_terms_select_policy" on public.commitment_terms;
drop policy if exists "commitment_terms_insert_policy" on public.commitment_terms;
drop policy if exists "commitment_terms_update_policy" on public.commitment_terms;
drop policy if exists "commitment_terms_delete_policy" on public.commitment_terms;

create policy "commitment_terms_select_policy"
on public.commitment_terms
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

create policy "commitment_terms_insert_policy"
on public.commitment_terms
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "commitment_terms_update_policy"
on public.commitment_terms
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and status in ('rascunho', 'pendente_correcao')
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and status in ('rascunho', 'enviado', 'pendente_correcao')
  )
);

create policy "commitment_terms_delete_policy"
on public.commitment_terms
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

drop policy if exists "internship_progress_select_policy" on public.internship_progress_records;
drop policy if exists "internship_progress_insert_policy" on public.internship_progress_records;
drop policy if exists "internship_progress_update_policy" on public.internship_progress_records;
drop policy if exists "internship_progress_delete_policy" on public.internship_progress_records;

create policy "internship_progress_select_policy"
on public.internship_progress_records
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

create policy "internship_progress_insert_policy"
on public.internship_progress_records
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "internship_progress_update_policy"
on public.internship_progress_records
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

create policy "internship_progress_delete_policy"
on public.internship_progress_records
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);
