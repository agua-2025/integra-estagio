-- 028_grants_inquiries_for_institution_flow.sql
-- Libera permissões básicas para o fluxo inicial de sondagens.
-- A instituição precisa listar e criar suas próprias sondagens.
-- A regra fina continua sendo controlada pelas policies de RLS.

grant usage on schema public to authenticated;

grant select, insert, update
on table public.inquiries
to authenticated;

grant select
on table public.courses
to authenticated;

grant select
on table public.institutions
to authenticated;

grant select
on table public.profiles
to authenticated;

alter table public.inquiries enable row level security;

drop policy if exists "inquiries_select_policy" on public.inquiries;

create policy "inquiries_select_policy"
on public.inquiries
for select
to authenticated
using (
  is_admin_or_coordenadoria()
  or institution_id = current_profile_institution_id()
);

drop policy if exists "inquiries_insert_policy" on public.inquiries;

create policy "inquiries_insert_policy"
on public.inquiries
for insert
to authenticated
with check (
  institution_id = current_profile_institution_id()
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
