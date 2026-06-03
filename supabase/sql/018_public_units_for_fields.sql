-- Integra Estágio
-- 018_public_units_for_fields.sql
-- Permite exibir publicamente unidades ativas vinculadas aos campos de estágio publicados.

grant select on table public.field_units to anon;
grant select on table public.municipal_units to anon;

drop policy if exists "municipal_units_public_select_policy" on public.municipal_units;

create policy "municipal_units_public_select_policy"
on public.municipal_units
for select
to anon
using (
  is_active = true
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
