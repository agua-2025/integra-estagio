-- 029_grants_inquiry_unit_responses_for_coordination.sql
-- Libera permissões para a Coordenadoria consultar e encaminhar sondagens às unidades.

grant usage on schema public to authenticated;

grant select, insert, update
on table public.inquiry_unit_responses
to authenticated;

grant select
on table public.municipal_units
to authenticated;

alter table public.inquiry_unit_responses enable row level security;

drop policy if exists "inquiry_unit_responses_select_policy" on public.inquiry_unit_responses;

create policy "inquiry_unit_responses_select_policy"
on public.inquiry_unit_responses
for select
to authenticated
using (
  is_admin_or_coordenadoria()
);

drop policy if exists "inquiry_unit_responses_insert_policy" on public.inquiry_unit_responses;

create policy "inquiry_unit_responses_insert_policy"
on public.inquiry_unit_responses
for insert
to authenticated
with check (
  is_admin_or_coordenadoria()
);

drop policy if exists "inquiry_unit_responses_update_policy" on public.inquiry_unit_responses;

create policy "inquiry_unit_responses_update_policy"
on public.inquiry_unit_responses
for update
to authenticated
using (
  is_admin_or_coordenadoria()
)
with check (
  is_admin_or_coordenadoria()
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
