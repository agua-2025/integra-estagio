-- Integra Estágio
-- 013_grants_data_api.sql
-- Permissões para expor tabelas à Data API do Supabase, mantendo RLS ativa.

grant usage on schema public to anon, authenticated;

-- Leitura pública somente dos campos publicados.
-- A RLS da tabela internship_fields continua filtrando:
-- is_public = true e status = 'ativo'.
grant select on public.internship_fields to anon;

-- Usuários autenticados acessam as tabelas pela API,
-- mas a RLS continua controlando o que cada perfil pode ver ou alterar.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.institutions to authenticated;
grant select, insert, update, delete on public.institution_contacts to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.municipal_units to authenticated;
grant select, insert, update, delete on public.internship_fields to authenticated;
grant select, insert, update, delete on public.field_courses to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.inquiry_unit_responses to authenticated;
grant select, insert, update, delete on public.cooperation_agreements to authenticated;
grant select, insert, update, delete on public.agreement_courses to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.student_presentations to authenticated;
grant select, insert, update, delete on public.student_documents to authenticated;
grant select, insert, update, delete on public.internship_authorizations to authenticated;
grant select, insert, update, delete on public.internships to authenticated;
grant select, insert, update, delete on public.occurrences to authenticated;
grant select, insert, update, delete on public.final_reports to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

-- Leitura pública complementar apenas se futuramente precisarmos exibir vínculos públicos.
-- Por enquanto, mantemos somente internship_fields liberada para anon.
