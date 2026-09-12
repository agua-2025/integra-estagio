-- Integra Estágio
-- 044_grants_unit_read_courses_from_inquiries.sql
-- Permite que a unidade municipal leia os cursos vinculados às sondagens encaminhadas para ela.

grant select on table public.courses to authenticated;

drop policy if exists "courses_select_unit_from_inquiries" on public.courses;

create policy "courses_select_unit_from_inquiries"
on public.courses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
  or exists (
    select 1
    from public.inquiries i
    join public.inquiry_unit_responses r
      on r.inquiry_id = i.id
    where i.course_id = courses.id
      and r.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);
