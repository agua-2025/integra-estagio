-- Integra Estágio
-- 016_field_units.sql
-- Vincula campos de estágio a uma ou mais unidades municipais.

create table if not exists public.field_units (
  id uuid primary key default gen_random_uuid(),

  field_id uuid not null references public.internship_fields(id) on delete cascade,
  municipal_unit_id uuid not null references public.municipal_units(id) on delete restrict,

  available_slots integer,
  shift text,
  supervisor_required boolean not null default true,
  notes text,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint field_units_available_slots_check check (
    available_slots is null or available_slots >= 0
  ),

  constraint field_units_unique unique (field_id, municipal_unit_id)
);

create trigger set_field_units_updated_at
before update on public.field_units
for each row
execute function public.set_updated_at();

create index if not exists idx_field_units_field_id
on public.field_units(field_id);

create index if not exists idx_field_units_municipal_unit_id
on public.field_units(municipal_unit_id);

create index if not exists idx_field_units_is_active
on public.field_units(is_active);

alter table public.field_units enable row level security;

drop policy if exists "field_units_select_policy" on public.field_units;
drop policy if exists "field_units_insert_policy" on public.field_units;
drop policy if exists "field_units_update_policy" on public.field_units;
drop policy if exists "field_units_delete_policy" on public.field_units;

create policy "field_units_select_policy"
on public.field_units
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.internship_fields f
    where f.id = field_units.field_id
      and f.is_public = true
      and f.status = 'ativo'
  )
  or public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "field_units_insert_policy"
on public.field_units
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "field_units_update_policy"
on public.field_units
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "field_units_delete_policy"
on public.field_units
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

grant select on table public.field_units to anon;
grant select, insert, update, delete on table public.field_units to authenticated;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
