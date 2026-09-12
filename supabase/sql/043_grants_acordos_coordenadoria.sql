-- Integra Estágio
-- 043_grants_acordos_coordenadoria.sql
-- Garante permissões para gerenciamento de acordos pela Coordenadoria.

grant select, insert, update, delete on table public.cooperation_agreements to authenticated;
grant select, insert, update, delete on table public.agreement_courses to authenticated;
grant select, update on table public.inquiries to authenticated;
