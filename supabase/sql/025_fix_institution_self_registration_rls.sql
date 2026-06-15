-- 025_fix_institution_self_registration_rls.sql
-- Corrige o fluxo normal de autocadastro institucional.
-- Após a Coordenadoria liberar o acesso, o profile institucional fica com institution_id null.
-- A instituição deve conseguir criar seu cadastro com status em_analise
-- e depois o sistema deve vincular profiles.institution_id à instituição criada.

drop policy if exists "institutions_insert_policy" on public.institutions;
drop policy if exists "profiles_update_policy" on public.profiles;

grant usage on schema public to authenticated;

grant select, insert, update
on table public.institutions
to authenticated;

grant select, update
on table public.profiles
to authenticated;

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;

create policy "institutions_insert_policy"
on public.institutions
for insert
to authenticated
with check (
  status = 'em_analise'
);

create policy "profiles_update_policy"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
