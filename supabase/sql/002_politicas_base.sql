-- Integra Estágio
-- 002_politicas_base.sql
-- Políticas RLS iniciais para tabelas base.

-- =========================================================
-- 1. Funções auxiliares de perfil
-- =========================================================

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_profile_institution_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.institution_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_profile_municipal_unit_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.municipal_unit_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.is_admin_or_coordenadoria()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_profile_role() in ('admin', 'coordenadoria');
$$;

-- =========================================================
-- 2. Limpeza de políticas anteriores
-- =========================================================

drop policy if exists "profiles_select_policy" on public.profiles;
drop policy if exists "profiles_update_policy" on public.profiles;

drop policy if exists "institutions_select_policy" on public.institutions;
drop policy if exists "institutions_insert_policy" on public.institutions;
drop policy if exists "institutions_update_policy" on public.institutions;
drop policy if exists "institutions_delete_policy" on public.institutions;

drop policy if exists "institution_contacts_select_policy" on public.institution_contacts;
drop policy if exists "institution_contacts_insert_policy" on public.institution_contacts;
drop policy if exists "institution_contacts_update_policy" on public.institution_contacts;
drop policy if exists "institution_contacts_delete_policy" on public.institution_contacts;

drop policy if exists "courses_select_policy" on public.courses;
drop policy if exists "courses_insert_policy" on public.courses;
drop policy if exists "courses_update_policy" on public.courses;
drop policy if exists "courses_delete_policy" on public.courses;

drop policy if exists "municipal_units_select_policy" on public.municipal_units;
drop policy if exists "municipal_units_insert_policy" on public.municipal_units;
drop policy if exists "municipal_units_update_policy" on public.municipal_units;
drop policy if exists "municipal_units_delete_policy" on public.municipal_units;

drop policy if exists "internship_fields_select_policy" on public.internship_fields;
drop policy if exists "internship_fields_insert_policy" on public.internship_fields;
drop policy if exists "internship_fields_update_policy" on public.internship_fields;
drop policy if exists "internship_fields_delete_policy" on public.internship_fields;

drop policy if exists "field_courses_select_policy" on public.field_courses;
drop policy if exists "field_courses_insert_policy" on public.field_courses;
drop policy if exists "field_courses_update_policy" on public.field_courses;
drop policy if exists "field_courses_delete_policy" on public.field_courses;

-- =========================================================
-- 3. Profiles
-- =========================================================

create policy "profiles_select_policy"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin_or_coordenadoria()
);

create policy "profiles_update_policy"
on public.profiles
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

-- Observação:
-- A criação de perfis será tratada em etapa própria.
-- Não liberar insert público aqui para evitar usuário escolhendo role indevida.

-- =========================================================
-- 4. Institutions
-- =========================================================

create policy "institutions_select_policy"
on public.institutions
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or id = public.current_profile_institution_id()
);

create policy "institutions_insert_policy"
on public.institutions
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "institutions_update_policy"
on public.institutions
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "institutions_delete_policy"
on public.institutions
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- 5. Institution contacts
-- =========================================================

create policy "institution_contacts_select_policy"
on public.institution_contacts
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "institution_contacts_insert_policy"
on public.institution_contacts
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "institution_contacts_update_policy"
on public.institution_contacts
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
)
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "institution_contacts_delete_policy"
on public.institution_contacts
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- 6. Courses
-- =========================================================

create policy "courses_select_policy"
on public.courses
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "courses_insert_policy"
on public.courses
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "courses_update_policy"
on public.courses
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
)
with check (
  public.is_admin_or_coordenadoria()
  or institution_id = public.current_profile_institution_id()
);

create policy "courses_delete_policy"
on public.courses
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- 7. Municipal units
-- =========================================================

create policy "municipal_units_select_policy"
on public.municipal_units
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or id = public.current_profile_municipal_unit_id()
  or public.current_profile_role() = 'instituicao'
);

create policy "municipal_units_insert_policy"
on public.municipal_units
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "municipal_units_update_policy"
on public.municipal_units
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "municipal_units_delete_policy"
on public.municipal_units
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- 8. Internship fields
-- =========================================================

create policy "internship_fields_select_policy"
on public.internship_fields
for select
to anon, authenticated
using (
  (
    is_public = true
    and status = 'ativo'
  )
  or public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
);

create policy "internship_fields_insert_policy"
on public.internship_fields
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "internship_fields_update_policy"
on public.internship_fields
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "internship_fields_delete_policy"
on public.internship_fields
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- 9. Field courses
-- =========================================================

create policy "field_courses_select_policy"
on public.field_courses
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.internship_fields f
    where f.id = field_courses.field_id
      and f.is_public = true
      and f.status = 'ativo'
  )
  or public.is_admin_or_coordenadoria()
);

create policy "field_courses_insert_policy"
on public.field_courses
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

create policy "field_courses_update_policy"
on public.field_courses
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

create policy "field_courses_delete_policy"
on public.field_courses
for delete
to authenticated
using (
  public.is_admin_or_coordenadoria()
);

-- =========================================================
-- Fim
-- =========================================================
