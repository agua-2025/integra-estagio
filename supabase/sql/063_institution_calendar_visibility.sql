-- Integra Estágio
-- Migration 063 - Consulta de exceções pela instituição
begin;

drop policy if exists institution_calendar_select
on public.unit_calendar_exceptions;

create policy institution_calendar_select
on public.unit_calendar_exceptions
for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    join public.cooperation_agreements ca
      on ca.institution_id = p.institution_id
    join public.inquiry_unit_responses r
      on r.inquiry_id = ca.inquiry_id
    where p.id = auth.uid()
      and p.is_active = true
      and p.role = 'instituicao'
      and ca.status = 'ativo'
      and ca.signed_at is not null
      and ca.published_at is not null
      and (ca.started_at is null or ca.started_at::date <= current_date)
      and (ca.ended_at is null or ca.ended_at::date >= current_date)
      and r.municipal_unit_id = unit_calendar_exceptions.municipal_unit_id
  )
);

commit;
