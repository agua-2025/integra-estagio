-- Integra Estágio
-- 014_ajuste_policy_campos_publicos.sql
-- Ajuste da política pública de leitura dos campos de estágio publicados.

drop policy if exists "internship_fields_select_policy" on public.internship_fields;
drop policy if exists "internship_fields_public_select_policy" on public.internship_fields;
drop policy if exists "internship_fields_authenticated_select_policy" on public.internship_fields;

grant usage on schema public to anon, authenticated;
grant select on table public.internship_fields to anon, authenticated;

create policy "internship_fields_public_select_policy"
on public.internship_fields
for select
to anon
using (
  is_public = true
  and status = 'ativo'
);

create policy "internship_fields_authenticated_select_policy"
on public.internship_fields
for select
to authenticated
using (
  (is_public = true and status = 'ativo')
  or public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
