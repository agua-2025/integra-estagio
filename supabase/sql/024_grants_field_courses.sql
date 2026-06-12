-- 024_grants_field_courses.sql
-- Permissões e políticas para manutenção dos vínculos entre campos de estágio e cursos compatíveis.
-- Esta tabela é usada pela Coordenadoria/Admin para vincular cursos ativos aos campos de estágio.

grant usage on schema public to authenticated;

grant select, insert, update, delete
on table public.field_courses
to authenticated;

alter table public.field_courses enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'field_courses'
      and policyname = 'field_courses_admin_select'
  ) then
    create policy field_courses_admin_select
    on public.field_courses
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
          and p.role in ('admin', 'coordenadoria')
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'field_courses'
      and policyname = 'field_courses_admin_insert'
  ) then
    create policy field_courses_admin_insert
    on public.field_courses
    for insert
    to authenticated
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
          and p.role in ('admin', 'coordenadoria')
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'field_courses'
      and policyname = 'field_courses_admin_update'
  ) then
    create policy field_courses_admin_update
    on public.field_courses
    for update
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
          and p.role in ('admin', 'coordenadoria')
      )
    )
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
          and p.role in ('admin', 'coordenadoria')
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'field_courses'
      and policyname = 'field_courses_admin_delete'
  ) then
    create policy field_courses_admin_delete
    on public.field_courses
    for delete
    to authenticated
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.is_active = true
          and p.role in ('admin', 'coordenadoria')
      )
    );
  end if;
end $$;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
