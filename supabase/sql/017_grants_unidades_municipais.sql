-- Integra Estágio
-- 017_grants_unidades_municipais.sql
-- Permissões para gestão administrativa de unidades municipais.

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.municipal_units
to authenticated;

grant execute on function public.is_admin_or_coordenadoria() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_municipal_unit_id() to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
