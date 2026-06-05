-- Integra Estágio
-- 023_grants_service_role_profiles.sql
-- Permite que o client administrativo crie profiles institucionais após liberar acesso.

grant usage on schema public to service_role;

grant select, insert, update, delete
on table public.profiles
to service_role;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
