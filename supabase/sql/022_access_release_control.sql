-- Integra Estágio
-- 022_access_release_control.sql
-- Controle de liberação do acesso institucional após aprovação da solicitação.

alter table public.access_requests
add column if not exists access_released boolean not null default false;

alter table public.access_requests
add column if not exists access_released_at timestamptz;

alter table public.access_requests
add column if not exists access_released_by uuid references public.profiles(id) on delete set null;

alter table public.access_requests
add column if not exists access_release_notes text;

create index if not exists idx_access_requests_access_released
on public.access_requests(access_released);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
