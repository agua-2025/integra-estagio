-- 032_add_coordination_approved_students_to_inquiries.sql
-- Adiciona campo para registrar a quantidade considerada viável/autorizada pela Coordenadoria.

alter table public.inquiries
add column if not exists coordination_approved_students integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inquiries_coordination_approved_students_check'
  ) then
    alter table public.inquiries
    add constraint inquiries_coordination_approved_students_check
    check (
      coordination_approved_students is null
      or coordination_approved_students >= 0
    );
  end if;
end $$;

grant select, update
on table public.inquiries
to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
