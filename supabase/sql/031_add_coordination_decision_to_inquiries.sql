-- 031_add_coordination_decision_to_inquiries.sql
-- Adiciona campos para a decisão final da Coordenadoria sobre a sondagem.

alter table public.inquiries
add column if not exists coordination_decision text;

alter table public.inquiries
add column if not exists coordination_notes text;

alter table public.inquiries
add column if not exists coordination_decided_at timestamptz;

alter table public.inquiries
add column if not exists coordination_decided_by uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inquiries_coordination_decision_check'
  ) then
    alter table public.inquiries
    add constraint inquiries_coordination_decision_check
    check (
      coordination_decision is null
      or coordination_decision in (
        'viavel',
        'parcialmente_viavel',
        'inviavel',
        'precisa_complementacao'
      )
    );
  end if;
end $$;

grant select, update
on table public.inquiries
to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
