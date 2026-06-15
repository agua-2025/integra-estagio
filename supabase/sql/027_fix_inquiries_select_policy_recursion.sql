-- 027_fix_inquiries_select_policy_recursion.sql
-- Corrige recursão infinita entre policies de inquiries e inquiry_unit_responses.
-- Nesta etapa, a instituição precisa apenas listar suas próprias sondagens.
-- A Coordenadoria/Admin pode visualizar todas.

drop policy if exists "inquiries_select_policy" on public.inquiries;

create policy "inquiries_select_policy"
on public.inquiries
for select
to authenticated
using (
  is_admin_or_coordenadoria()
  or institution_id = current_profile_institution_id()
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
