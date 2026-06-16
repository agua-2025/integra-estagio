-- 030_grants_unit_read_and_answer_inquiries.sql
-- Permite que usuários vinculados a unidades municipais visualizem e respondam
-- apenas as sondagens encaminhadas para sua própria unidade.

grant usage on schema public to authenticated;

grant select, update
on table public.inquiry_unit_responses
to authenticated;

grant select
on table public.inquiries
to authenticated;

grant select
on table public.institutions
to authenticated;

grant select
on table public.courses
to authenticated;

grant select
on table public.municipal_units
to authenticated;

alter table public.inquiry_unit_responses enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "inquiry_unit_responses_select_policy" on public.inquiry_unit_responses;

create policy "inquiry_unit_responses_select_policy"
on public.inquiry_unit_responses
for select
to authenticated
using (
  is_admin_or_coordenadoria()
  or municipal_unit_id = (
    select p.municipal_unit_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

drop policy if exists "inquiry_unit_responses_update_policy" on public.inquiry_unit_responses;

create policy "inquiry_unit_responses_update_policy"
on public.inquiry_unit_responses
for update
to authenticated
using (
  is_admin_or_coordenadoria()
  or municipal_unit_id = (
    select p.municipal_unit_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
)
with check (
  is_admin_or_coordenadoria()
  or municipal_unit_id = (
    select p.municipal_unit_id
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  )
);

drop policy if exists "inquiries_select_policy" on public.inquiries;

create policy "inquiries_select_policy"
on public.inquiries
for select
to authenticated
using (
  is_admin_or_coordenadoria()
  or institution_id = current_profile_institution_id()
  or exists (
    select 1
    from public.inquiry_unit_responses r
    where r.inquiry_id = inquiries.id
      and r.municipal_unit_id = (
        select p.municipal_unit_id
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
      )
  )
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
