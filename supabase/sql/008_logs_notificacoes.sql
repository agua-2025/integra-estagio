-- Integra Estágio
-- 008_logs_notificacoes.sql
-- Tabelas e políticas para auditoria e notificações internas.

-- =========================================================
-- Tabela: audit_logs
-- =========================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references public.profiles(id) on delete set null,

  module text not null,
  action text not null,
  entity_table text,
  entity_id uuid,

  old_data jsonb,
  new_data jsonb,
  description text,

  created_at timestamptz not null default now(),

  constraint audit_logs_module_check check (
    module in (
      'profiles',
      'institutions',
      'courses',
      'municipal_units',
      'internship_fields',
      'inquiries',
      'inquiry_unit_responses',
      'cooperation_agreements',
      'students',
      'student_presentations',
      'student_documents',
      'internship_authorizations',
      'internships',
      'occurrences',
      'final_reports',
      'notifications',
      'system'
    )
  ),

  constraint audit_logs_action_check check (
    length(trim(action)) > 0
  )
);

-- =========================================================
-- Tabela: notifications
-- =========================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  message text not null,

  related_module text,
  related_id uuid,

  read_at timestamptz,

  created_at timestamptz not null default now(),

  constraint notifications_title_check check (
    length(trim(title)) > 0
  ),

  constraint notifications_message_check check (
    length(trim(message)) > 0
  )
);

-- =========================================================
-- Índices
-- =========================================================

create index if not exists idx_audit_logs_user_id
on public.audit_logs(user_id);

create index if not exists idx_audit_logs_module
on public.audit_logs(module);

create index if not exists idx_audit_logs_entity
on public.audit_logs(entity_table, entity_id);

create index if not exists idx_audit_logs_created_at
on public.audit_logs(created_at);

create index if not exists idx_notifications_profile_id
on public.notifications(profile_id);

create index if not exists idx_notifications_read_at
on public.notifications(read_at);

create index if not exists idx_notifications_created_at
on public.notifications(created_at);

-- =========================================================
-- RLS
-- =========================================================

alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "audit_logs_select_policy" on public.audit_logs;
drop policy if exists "audit_logs_insert_policy" on public.audit_logs;
drop policy if exists "audit_logs_update_policy" on public.audit_logs;
drop policy if exists "audit_logs_delete_policy" on public.audit_logs;

drop policy if exists "notifications_select_policy" on public.notifications;
drop policy if exists "notifications_insert_policy" on public.notifications;
drop policy if exists "notifications_update_policy" on public.notifications;
drop policy if exists "notifications_delete_policy" on public.notifications;

-- =========================================================
-- Políticas RLS: audit_logs
-- =========================================================

create policy "audit_logs_select_policy"
on public.audit_logs
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

create policy "audit_logs_insert_policy"
on public.audit_logs
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "audit_logs_update_policy"
on public.audit_logs
for update
to authenticated
using (
  false
)
with check (
  false
);

create policy "audit_logs_delete_policy"
on public.audit_logs
for delete
to authenticated
using (
  false
);

-- =========================================================
-- Políticas RLS: notifications
-- =========================================================

create policy "notifications_select_policy"
on public.notifications
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin_or_coordenadoria()
);

create policy "notifications_insert_policy"
on public.notifications
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "notifications_update_policy"
on public.notifications
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin_or_coordenadoria()
)
with check (
  profile_id = auth.uid()
  or public.is_admin_or_coordenadoria()
);

create policy "notifications_delete_policy"
on public.notifications
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
