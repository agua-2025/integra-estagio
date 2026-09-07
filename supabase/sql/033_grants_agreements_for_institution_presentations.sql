-- Integra Estágio
-- 033_grants_agreements_for_institution_presentations.sql
-- Libera leitura segura de acordos e cursos vinculados para apresentação de estudantes pela instituição.

grant select on table public.cooperation_agreements to authenticated;
grant select on table public.agreement_courses to authenticated;

drop policy if exists "cooperation_agreements_select_institution_own" on public.cooperation_agreements;

create policy "cooperation_agreements_select_institution_own"
on public.cooperation_agreements
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

drop policy if exists "agreement_courses_select_institution_own" on public.agreement_courses;

create policy "agreement_courses_select_institution_own"
on public.agreement_courses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.cooperation_agreements ca
    where ca.id = agreement_courses.agreement_id
      and ca.institution_id = public.current_profile_institution_id()
  )
);
