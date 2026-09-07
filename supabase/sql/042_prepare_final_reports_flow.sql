-- Integra Estágio
-- 042_prepare_final_reports_flow.sql
-- Organiza permissões e controle do relatório final vinculado ao estágio.

grant select, insert, update on table public.final_reports to authenticated;

create unique index if not exists final_reports_internship_id_unique_idx
on public.final_reports(internship_id);

alter table public.final_reports enable row level security;

drop policy if exists "final_reports_select_allowed"
on public.final_reports;

create policy "final_reports_select_allowed"
on public.final_reports
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
  or exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.institution_id = public.current_profile_institution_id()
  )
);

drop policy if exists "final_reports_insert_unit_own"
on public.final_reports;

create policy "final_reports_insert_unit_own"
on public.final_reports
for insert
to authenticated
with check (
  exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);

drop policy if exists "final_reports_update_allowed"
on public.final_reports;

create policy "final_reports_update_allowed"
on public.final_reports
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or exists (
    select 1
    from public.internships i
    where i.id = final_reports.internship_id
      and i.municipal_unit_id = public.current_profile_municipal_unit_id()
  )
);
