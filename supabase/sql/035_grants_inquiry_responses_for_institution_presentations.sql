-- Integra Estágio
-- 035_grants_inquiry_responses_for_institution_presentations.sql
-- Permite que a instituição leia as respostas das unidades vinculadas às suas próprias sondagens sem causar recursão de RLS.

grant select on table public.inquiry_unit_responses to authenticated;
grant select on table public.municipal_units to authenticated;

drop policy if exists "inquiry_unit_responses_select_institution_own"
on public.inquiry_unit_responses;

create or replace function public.institution_can_read_inquiry_response(target_inquiry_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.inquiries i
    where i.id = target_inquiry_id
      and i.institution_id = public.current_profile_institution_id()
  );
$$;

grant execute on function public.institution_can_read_inquiry_response(uuid)
to authenticated;

create policy "inquiry_unit_responses_select_institution_own"
on public.inquiry_unit_responses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or public.institution_can_read_inquiry_response(inquiry_id)
);
