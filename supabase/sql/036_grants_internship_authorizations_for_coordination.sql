-- Integra Estágio
-- 036_grants_internship_authorizations_for_coordination.sql
-- Libera permissões necessárias para emissão de autorização de início pela Coordenadoria.

grant select, insert, update on table public.internship_authorizations to authenticated;
grant select, update on table public.student_presentations to authenticated;
