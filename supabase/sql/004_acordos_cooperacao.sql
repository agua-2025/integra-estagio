-- Integra Estágio
-- 004_acordos_cooperacao.sql
-- Tabelas e políticas do fluxo de Acordos de Cooperação Técnica.

create table if not exists public.cooperation_agreements (
  id uuid primary key default gen_random_uuid(),

  institution_id uuid not null references public.institutions(id) on delete restrict,
  inquiry_id uuid not null references public.inquiries(id) on delete restrict,

  status text not null default 'rascunho',

  legal_representative_name text,
  institution_responsible_name text,

  started_at date,
  ended_at date,
  signed_at date,
  published_at date,
  publication_reference text,
  document_url text,
  notes text,

  created_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cooperation_agreements_status_check check (
    status in (
      'rascunho',
      'em_analise',
      'pendente_correcao',
      'minuta_gerada',
      'aguardando_assinatura',
      'assinado',
      'publicado',
      'ativo',
      'vencido',
      'encerrado',
      'cancelado'
    )
  ),

  constraint cooperation_agreements_dates_check check (
    started_at is null
    or ended_at is null
    or ended_at >= started_at
  )
);

create trigger set_cooperation_agreements_updated_at
before update on public.cooperation_agreements
for each row
execute function public.set_updated_at();

create table if not exists public.agreement_courses (
  id uuid primary key default gen_random_uuid(),

  agreement_id uuid not null references public.cooperation_agreements(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint agreement_courses_unique unique (agreement_id, course_id)
);

-- =========================================================
-- Função: validar se o acordo está vinculado a sondagem viável
-- =========================================================

create or replace function public.validate_agreement_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inquiry_record record;
begin
  select
    i.id,
    i.institution_id,
    i.status
  into inquiry_record
  from public.inquiries i
  where i.id = new.inquiry_id;

  if inquiry_record.id is null then
    raise exception 'Sondagem vinculada ao acordo não encontrada.';
  end if;

  if inquiry_record.institution_id <> new.institution_id then
    raise exception 'A sondagem vinculada pertence a outra instituição.';
  end if;

  if inquiry_record.status not in ('viavel', 'viavel_parcial', 'convertida_em_acordo') then
    raise exception 'O acordo só pode ser criado a partir de sondagem viável ou viável parcial.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_agreement_inquiry_trigger on public.cooperation_agreements;

create trigger validate_agreement_inquiry_trigger
before insert or update of institution_id, inquiry_id
on public.cooperation_agreements
for each row
execute function public.validate_agreement_inquiry();

-- =========================================================
-- Função: validar se o curso pertence à mesma instituição do acordo
-- =========================================================

create or replace function public.validate_agreement_course()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  agreement_institution_id uuid;
  course_institution_id uuid;
begin
  select institution_id
  into agreement_institution_id
  from public.cooperation_agreements
  where id = new.agreement_id;

  select institution_id
  into course_institution_id
  from public.courses
  where id = new.course_id;

  if agreement_institution_id is null then
    raise exception 'Acordo não encontrado.';
  end if;

  if course_institution_id is null then
    raise exception 'Curso não encontrado.';
  end if;

  if agreement_institution_id <> course_institution_id then
    raise exception 'O curso não pertence à instituição vinculada ao acordo.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_agreement_course_trigger on public.agreement_courses;

create trigger validate_agreement_course_trigger
before insert or update of agreement_id, course_id
on public.agreement_courses
for each row
execute function public.validate_agreement_course();

create index if not exists idx_cooperation_agreements_institution_id
on public.cooperation_agreements(institution_id);

create index if not exists idx_cooperation_agreements_inquiry_id
on public.cooperation_agreements(inquiry_id);

create index if not exists idx_cooperation_agreements_status
on public.cooperation_agreements(status);

create index if not exists idx_cooperation_agreements_dates
on public.cooperation_agreements(started_at, ended_at);

create index if not exists idx_agreement_courses_agreement_id
on public.agreement_courses(agreement_id);

create index if not exists idx_agreement_courses_course_id
on public.agreement_courses(course_id);

alter table public.cooperation_agreements enable row level security;
alter table public.agreement_courses enable row level security;

-- =========================================================
-- Limpeza de políticas anteriores
-- =========================================================

drop policy if exists "cooperation_agreements_select_policy" on public.cooperation_agreements;
drop policy if exists "cooperation_agreements_insert_policy" on public.cooperation_agreements;
drop policy if exists "cooperation_agreements_update_policy" on public.cooperation_agreements;
drop policy if exists "cooperation_agreements_delete_policy" on public.cooperation_agreements;

drop policy if exists "agreement_courses_select_policy" on public.agreement_courses;
drop policy if exists "agreement_courses_insert_policy" on public.agreement_courses;
drop policy if exists "agreement_courses_update_policy" on public.agreement_courses;
drop policy if exists "agreement_courses_delete_policy" on public.agreement_courses;

-- =========================================================
-- Políticas RLS: cooperation_agreements
-- =========================================================

create policy "cooperation_agreements_select_policy"
on public.cooperation_agreements
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "cooperation_agreements_insert_policy"
on public.cooperation_agreements
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "cooperation_agreements_update_policy"
on public.cooperation_agreements
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
    and status in ('rascunho', 'em_analise')
  )
);

create policy "cooperation_agreements_delete_policy"
on public.cooperation_agreements
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: agreement_courses
-- =========================================================

create policy "agreement_courses_select_policy"
on public.agreement_courses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements a
    where a.id = agreement_courses.agreement_id
      and a.institution_id = public.current_profile_institution_id()
  )
);

create policy "agreement_courses_insert_policy"
on public.agreement_courses
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements a
    where a.id = agreement_courses.agreement_id
      and a.institution_id = public.current_profile_institution_id()
      and a.status in ('rascunho', 'pendente_correcao')
  )
);

create policy "agreement_courses_update_policy"
on public.agreement_courses
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements a
    where a.id = agreement_courses.agreement_id
      and a.institution_id = public.current_profile_institution_id()
      and a.status in ('rascunho', 'pendente_correcao')
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements a
    where a.id = agreement_courses.agreement_id
      and a.institution_id = public.current_profile_institution_id()
      and a.status in ('rascunho', 'pendente_correcao')
  )
);

create policy "agreement_courses_delete_policy"
on public.agreement_courses
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements a
    where a.id = agreement_courses.agreement_id
      and a.institution_id = public.current_profile_institution_id()
      and a.status in ('rascunho', 'pendente_correcao')
  )
);

-- =========================================================
-- Fim
-- =========================================================
