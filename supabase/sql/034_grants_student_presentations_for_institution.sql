-- Integra Estágio
-- 034_grants_student_presentations_for_institution.sql
-- Libera permissões necessárias para apresentação inicial de estudantes pela instituição.

grant select, insert, update on table public.students to authenticated;
grant select, insert, update on table public.student_presentations to authenticated;
grant select, insert, update on table public.student_documents to authenticated;
