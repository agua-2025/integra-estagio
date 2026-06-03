-- Integra Estágio
-- 020_instituicao_auto_cadastro.sql
-- Permite que usuário com perfil de instituição cadastre sua instituição e seus cursos.

grant usage on schema public to authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.institutions to authenticated;
grant select, insert, update on table public.courses to authenticated;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_institution_id() to authenticated;
grant execute on function public.is_admin_or_coordenadoria() to authenticated;

drop policy if exists "profiles_update_policy" on public.profiles;

create policy "profiles_update_policy"
on public.profiles
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or id = auth.uid()
)
with check (
  public.is_admin_or_coordenadoria()
  or (
    id = auth.uid()
    and role = public.current_profile_role()
    and is_active = true
  )
);

drop policy if exists "institutions_insert_policy" on public.institutions;

create policy "institutions_insert_policy"
on public.institutions
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
  or (
    public.current_profile_role() = 'instituicao'
    and status = 'em_analise'
  )
);

drop policy if exists "institutions_update_policy" on public.institutions;

create policy "institutions_update_policy"
on public.institutions
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or (
    id = public.current_profile_institution_id()
    and status in ('em_analise', 'pendente')
  )
)
with check (
  public.is_admin_or_coordenadoria()
  or (
    id = public.current_profile_institution_id()
    and status in ('em_analise', 'pendente')
  )
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
