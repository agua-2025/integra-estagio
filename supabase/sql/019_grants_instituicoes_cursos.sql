-- Integra Estágio
-- 019_grants_instituicoes_cursos.sql
-- Permissões para gestão administrativa de instituições e cursos.

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.institutions
to authenticated;

grant select, insert, update, delete
on table public.courses
to authenticated;

grant execute on function public.is_admin_or_coordenadoria() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_institution_id() to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
