-- Integra Estágio
-- 021_access_requests.sql
-- Solicitações públicas de acesso institucional.

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),

  requester_name text not null,
  requester_email text not null,
  requester_phone text,

  institution_name text not null,
  institution_cnpj text,
  city text,
  state text,
  notes text,

  status text not null default 'pendente',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint access_requests_status_check check (
    status in ('pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada')
  ),

  constraint access_requests_requester_name_check check (
    length(trim(requester_name)) > 0
  ),

  constraint access_requests_requester_email_check check (
    length(trim(requester_email)) > 0
  ),

  constraint access_requests_institution_name_check check (
    length(trim(institution_name)) > 0
  )
);

create trigger set_access_requests_updated_at
before update on public.access_requests
for each row
execute function public.set_updated_at();

create index if not exists idx_access_requests_status
on public.access_requests(status);

create index if not exists idx_access_requests_created_at
on public.access_requests(created_at);

alter table public.access_requests enable row level security;

drop policy if exists "access_requests_insert_public_policy" on public.access_requests;
drop policy if exists "access_requests_select_admin_policy" on public.access_requests;
drop policy if exists "access_requests_update_admin_policy" on public.access_requests;
drop policy if exists "access_requests_delete_admin_policy" on public.access_requests;

create policy "access_requests_insert_public_policy"
on public.access_requests
for insert
to anon, authenticated
with check (
  status = 'pendente'
);

create policy "access_requests_select_admin_policy"
on public.access_requests
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

create policy "access_requests_update_admin_policy"
on public.access_requests
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "access_requests_delete_admin_policy"
on public.access_requests
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

grant usage on schema public to anon, authenticated;
grant insert on table public.access_requests to anon, authenticated;
grant select, update, delete on table public.access_requests to authenticated;

grant execute on function public.is_admin_or_coordenadoria() to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
