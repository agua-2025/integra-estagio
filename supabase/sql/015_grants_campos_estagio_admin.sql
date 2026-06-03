-- Integra Estágio
-- 015_grants_campos_estagio_admin.sql
-- Permissões para ações administrativas em campos de estágio.
-- A RLS continua controlando quem pode inserir, alterar ou excluir.

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.internship_fields
to authenticated;

grant execute on function public.is_admin_or_coordenadoria() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_municipal_unit_id() to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
