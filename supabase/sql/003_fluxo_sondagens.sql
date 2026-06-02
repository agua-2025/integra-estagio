-- Integra Estágio
-- 003_fluxo_sondagens.sql
-- Tabelas do fluxo de sondagens de campo e respostas das unidades.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),

  institution_id uuid not null references public.institutions(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  field_id uuid references public.internship_fields(id) on delete set null,

  requested_area text,
  requested_students integer not null,
  required_workload integer,
  intended_period text,
  notes text,

  status text not null default 'rascunho',

  submitted_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  consolidated_by uuid references public.profiles(id) on delete set null,

  consolidated_notes text,
  consolidated_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint inquiries_requested_students_check check (requested_students > 0),

  constraint inquiries_required_workload_check check (
    required_workload is null or required_workload > 0
  ),

  constraint inquiries_status_check check (
    status in (
      'rascunho',
      'enviada',
      'recebida',
      'em_analise',
      'encaminhada_unidade',
      'aguardando_unidade',
      'complementacao_solicitada',
      'viavel',
      'viavel_parcial',
      'sem_disponibilidade',
      'cancelada',
      'convertida_em_acordo'
    )
  )
);

create trigger set_inquiries_updated_at
before update on public.inquiries
for each row
execute function public.set_updated_at();

create table if not exists public.inquiry_unit_responses (
  id uuid primary key default gen_random_uuid(),

  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  response_status text not null,
  available_slots integer,
  possible_schedule text,
  compatible_activities text,
  supervisor_name text,
  notes text,

  responded_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint inquiry_unit_responses_available_slots_check check (
    available_slots is null or available_slots >= 0
  ),

  constraint inquiry_unit_responses_status_check check (
    response_status in (
      'campo_disponivel',
      'campo_com_limite',
      'sem_disponibilidade',
      'precisa_analise'
    )
  ),

  constraint inquiry_unit_responses_unique unique (inquiry_id, municipal_unit_id)
);

create trigger set_inquiry_unit_responses_updated_at
before update on public.inquiry_unit_responses
for each row
execute function public.set_updated_at();

create index if not exists idx_inquiries_institution_id on public.inquiries(institution_id);
create index if not exists idx_inquiries_course_id on public.inquiries(course_id);
create index if not exists idx_inquiries_field_id on public.inquiries(field_id);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_submitted_by on public.inquiries(submitted_by);

create index if not exists idx_inquiry_unit_responses_inquiry_id on public.inquiry_unit_responses(inquiry_id);
create index if not exists idx_inquiry_unit_responses_unit_id on public.inquiry_unit_responses(municipal_unit_id);
create index if not exists idx_inquiry_unit_responses_status on public.inquiry_unit_responses(response_status);

alter table public.inquiries enable row level security;
alter table public.inquiry_unit_responses enable row level security;

-- =========================================================
-- Limpeza de políticas anteriores
-- =========================================================

drop policy if exists "inquiries_select_policy" on public.inquiries;
drop policy if exists "inquiries_insert_policy" on public.inquiries;
drop policy if exists "inquiries_update_policy" on public.inquiries;
drop policy if exists "inquiries_delete_policy" on public.inquiries;

drop policy if exists "inquiry_unit_responses_select_policy" on public.inquiry_unit_responses;
drop policy if exists "inquiry_unit_responses_insert_policy" on public.inquiry_unit_responses;
drop policy if exists "inquiry_unit_responses_update_policy" on public.inquiry_unit_responses;
drop policy if exists "inquiry_unit_responses_delete_policy" on public.inquiry_unit_responses;

-- =========================================================
-- Políticas RLS: inquiries
-- =========================================================

create policy "inquiries_select_policy"
on public.inquiries
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or exists (
    select 1
    from public.inquiry_unit_responses r
    where r.inquiry_id = inquiries.id
      and r.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);

create policy "inquiries_insert_policy"
on public.inquiries
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "inquiries_update_policy"
on public.inquiries
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and status in ('rascunho', 'complementacao_solicitada')
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or (
    institution_id = public.current_profile_institution_id()
    and status in ('rascunho', 'enviada')
  )
);

create policy "inquiries_delete_policy"
on public.inquiries
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Políticas RLS: inquiry_unit_responses
-- =========================================================

create policy "inquiry_unit_responses_select_policy"
on public.inquiry_unit_responses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or exists (
    select 1
    from public.inquiries i
    where i.id = inquiry_unit_responses.inquiry_id
      and i.institution_id = public.current_profile_institution_id()
  )
);

create policy "inquiry_unit_responses_insert_policy"
on public.inquiry_unit_responses
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "inquiry_unit_responses_update_policy"
on public.inquiry_unit_responses
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

create policy "inquiry_unit_responses_delete_policy"
on public.inquiry_unit_responses
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
