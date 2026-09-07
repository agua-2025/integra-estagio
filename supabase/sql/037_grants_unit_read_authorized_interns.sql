-- Integra Estágio
-- 037_grants_unit_read_authorized_interns.sql
-- Permite que a unidade municipal visualize os estudantes autorizados para sua própria unidade.

grant select on table public.internship_authorizations to authenticated;
grant select on table public.students to authenticated;
grant select on table public.institutions to authenticated;
grant select on table public.courses to authenticated;
grant select on table public.municipal_units to authenticated;

drop policy if exists "internship_authorizations_select_unit_own"
on public.internship_authorizations;

create policy "internship_authorizations_select_unit_own"
on public.internship_authorizations
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);
