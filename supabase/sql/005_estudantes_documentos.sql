-- Integra Estágio
-- 005_estudantes_documentos.sql
-- Tabelas e políticas para estudantes, apresentações e documentos.

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  cpf text,
  email text,
  phone text,
  birth_date date,

  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,

  academic_registration text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint students_cpf_unique unique (cpf)
);

create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create table if not exists public.student_presentations (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.students(id) on delete restrict,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  agreement_id uuid not null references public.cooperation_agreements(id) on delete restrict,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  field_id uuid references public.internship_fields(id) on delete set null,
  municipal_unit_id uuid references public.municipal_units(id) on delete set null,

  intended_period text,
  intended_schedule text,
  required_workload integer,

  status text not null default 'rascunho',

  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_presentations_required_workload_check check (
    required_workload is null or required_workload > 0
  ),

  constraint student_presentations_status_check check (
    status in (
      'rascunho',
      'apresentado',
      'em_analise',
      'pendente_correcao',
      'documentos_validados',
      'apto_para_autorizacao',
      'autorizado',
      'indeferido',
      'cancelado'
    )
  )
);

create trigger set_student_presentations_updated_at
before update on public.student_presentations
for each row
execute function public.set_updated_at();

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),

  presentation_id uuid not null references public.student_presentations(id) on delete cascade,

  document_type text not null,
  file_path text,
  status text not null default 'pendente',
  notes text,

  uploaded_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_documents_type_check check (
    document_type in (
      'carta_apresentacao',
      'termo_compromisso',
      'comprovante_matricula',
      'seguro',
      'plano_atividades',
      'documento_identificacao',
      'outro'
    )
  ),

  constraint student_documents_status_check check (
    status in (
      'pendente',
      'enviado',
      'validado',
      'rejeitado',
      'substituido'
    )
  )
);

create trigger set_student_documents_updated_at
before update on public.student_documents
for each row
execute function public.set_updated_at();

-- =========================================================
-- Função: validar se o estudante, curso e instituição são coerentes
-- =========================================================

create or replace function public.validate_student_course_institution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  course_institution_id uuid;
begin
  select institution_id
  into course_institution_id
  from public.courses
  where id = new.course_id;

  if course_institution_id is null then
    raise exception 'Curso não encontrado.';
  end if;

  if course_institution_id <> new.institution_id then
    raise exception 'O curso informado não pertence à instituição do estudante.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_student_course_institution_trigger on public.students;

create trigger validate_student_course_institution_trigger
before insert or update of institution_id, course_id
on public.students
for each row
execute function public.validate_student_course_institution();

-- =========================================================
-- Função: validar apresentação de estudante
-- =========================================================

create or replace function public.validate_student_presentation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_record record;
  agreement_record record;
  agreement_course_exists boolean;
begin
  select
    s.id,
    s.institution_id,
    s.course_id
  into student_record
  from public.students s
  where s.id = new.student_id;

  if student_record.id is null then
    raise exception 'Estudante não encontrado.';
  end if;

  if student_record.institution_id <> new.institution_id then
    raise exception 'O estudante não pertence à instituição informada.';
  end if;

  if student_record.course_id <> new.course_id then
    raise exception 'O curso da apresentação não corresponde ao curso do estudante.';
  end if;

  select
    a.id,
    a.institution_id,
    a.status,
    a.started_at,
    a.ended_at,
    a.signed_at,
    a.published_at
  into agreement_record
  from public.cooperation_agreements a
  where a.id = new.agreement_id;

  if agreement_record.id is null then
    raise exception 'Acordo de Cooperação não encontrado.';
  end if;

  if agreement_record.institution_id <> new.institution_id then
    raise exception 'O acordo não pertence à instituição informada.';
  end if;

  if agreement_record.status <> 'ativo' then
    raise exception 'A apresentação de estudante exige Acordo de Cooperação ativo.';
  end if;

  if agreement_record.signed_at is null then
    raise exception 'A apresentação de estudante exige acordo assinado.';
  end if;

  if agreement_record.published_at is null then
    raise exception 'A apresentação de estudante exige acordo publicado.';
  end if;

  if agreement_record.started_at is not null and agreement_record.started_at > current_date then
    raise exception 'O acordo ainda não está vigente.';
  end if;

  if agreement_record.ended_at is not null and agreement_record.ended_at < current_date then
    raise exception 'O acordo está vencido.';
  end if;

  select exists (
    select 1
    from public.agreement_courses ac
    where ac.agreement_id = new.agreement_id
      and ac.course_id = new.course_id
      and ac.is_active = true
  )
  into agreement_course_exists;

  if agreement_course_exists is not true then
    raise exception 'O curso do estudante não está abrangido pelo acordo.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_student_presentation_trigger on public.student_presentations;

create trigger validate_student_presentation_trigger
before insert or update of student_id, institution_id, course_id, agreement_id
on public.student_presentations
for each row
execute function public.validate_student_presentation();

create index if not exists idx_students_institution_id
on public.students(institution_id);

create index if not exists idx_students_course_id
on public.students(course_id);

create index if not exists idx_students_email
on public.students(email);

create index if not exists idx_student_presentations_student_id
on public.student_presentations(student_id);

create index if not exists idx_student_presentations_institution_id
on public.student_presentations(institution_id);

create index if not exists idx_student_presentations_course_id
on public.student_presentations(course_id);

create index if not exists idx_student_presentations_agreement_id
on public.student_presentations(agreement_id);

create index if not exists idx_student_presentations_status
on public.student_presentations(status);

create index if not exists idx_student_documents_presentation_id
on public.student_documents(presentation_id);

create index if not exists idx_student_documents_type
on public.student_documents(document_type);

create index if not exists idx_student_documents_status
on public.student_documents(status);

alter table public.students enable row level security;
alter table public.student_presentations enable row level security;
alter table public.student_documents enable row level security;

-- =========================================================
-- Limpeza de políticas anteriores
-- =========================================================

drop policy if exists "students_select_policy" on public.students;
drop policy if exists "students_insert_policy" on public.students;
drop policy if exists "students_update_policy" on public.students;
drop policy if exists "students_delete_policy" on public.students;

drop policy if exists "student_presentations_select_policy" on public.student_presentations;
drop policy if exists "student_presentations_insert_policy" on public.student_presentations;
drop policy if exists "student_presentations_update_policy" on public.student_presentations;
drop policy if exists "student_presentations_delete_policy" on public.student_presentations;

drop policy if exists "student_documents_select_policy" on public.student_documents;
drop policy if exists "student_documents_insert_policy" on public.student_documents;
drop policy if exists "student_documents_update_policy" on public.student_documents;
drop policy if exists "student_documents_delete_policy" on public.student_documents;

-- =========================================================
-- Políticas RLS: students
-- =========================================================

create policy "students_select_policy"
on public.students
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
  or exists (
    select 1
    from public.student_presentations sp
    where sp.student_id = students.id
      and sp.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);

create policy "students_insert_policy"
on public.students
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "students_update_policy"
on public.students
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
)
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "students_delete_policy"
on public.students
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: student_presentations
-- =========================================================

create policy "student_presentations_select_policy"
on public.student_presentations
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or student_id = (
    select p.student_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1
  )
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "student_presentations_insert_policy"
on public.student_presentations
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "student_presentations_update_policy"
on public.student_presentations
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
    and status in ('rascunho', 'apresentado')
  )
);

create policy "student_presentations_delete_policy"
on public.student_presentations
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: student_documents
-- =========================================================

create policy "student_documents_select_policy"
on public.student_documents
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.student_presentations sp
    where sp.id = student_documents.presentation_id
      and (
        sp.institution_id = public.current_profile_institution_id()
        or sp.municipal_unit_id = public.current_profile_municipal_unit_id()
        or sp.student_id = (
          select p.student_id
          from public.profiles p
          where p.id = auth.uid()
            and p.is_active = true
          limit 1
        )
      )
  )
);

create policy "student_documents_insert_policy"
on public.student_documents
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.student_presentations sp
    where sp.id = student_documents.presentation_id
      and sp.institution_id = public.current_profile_institution_id()
      and sp.status in ('rascunho', 'pendente_correcao', 'apresentado')
  )
);

create policy "student_documents_update_policy"
on public.student_documents
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.student_presentations sp
    where sp.id = student_documents.presentation_id
      and sp.institution_id = public.current_profile_institution_id()
      and sp.status in ('rascunho', 'pendente_correcao', 'apresentado')
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.student_presentations sp
    where sp.id = student_documents.presentation_id
      and sp.institution_id = public.current_profile_institution_id()
      and sp.status in ('rascunho', 'pendente_correcao', 'apresentado')
  )
);

create policy "student_documents_delete_policy"
on public.student_documents
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
