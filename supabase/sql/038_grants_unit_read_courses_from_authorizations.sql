-- Integra Estágio
-- 038_grants_unit_read_courses_from_authorizations.sql
-- Permite que a unidade leia cursos vinculados às autorizações emitidas para sua própria unidade.

drop policy if exists "courses_select_unit_authorized_interns"
on public.courses;

create policy "courses_select_unit_authorized_interns"
on public.courses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or exists (
    select 1
    from public.internship_authorizations ia
    where ia.course_id = courses.id
      and ia.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);
