-- Integra Estágio
-- 040_prepare_internships_flow.sql
-- Organiza a tabela internships como base central do estágio em acompanhamento.

grant select, insert, update on table public.internships to authenticated;

create unique index if not exists internships_authorization_id_unique_idx
on public.internships(authorization_id);

alter table public.internships enable row level security;

drop policy if exists "internships_select_allowed"
on public.internships;

create policy "internships_select_allowed"
on public.internships
for select
to authenticated
using (
  public.is_admin_or_coordenadoria()
  or municipal_unit_id = public.current_profile_municipal_unit_id()
  or institution_id = public.current_profile_institution_id()
);

drop policy if exists "internships_insert_coordination"
on public.internships;

create policy "internships_insert_coordination"
on public.internships
for insert
to authenticated
with check (
  public.is_admin_or_coordenadoria()
);

drop policy if exists "internships_update_coordination"
on public.internships;

create policy "internships_update_coordination"
on public.internships
for update
to authenticated
using (
  public.is_admin_or_coordenadoria()
)
with check (
  public.is_admin_or_coordenadoria()
);

insert into public.internships (
  authorization_id,
  student_id,
  institution_id,
  course_id,
  municipal_unit_id,
  supervisor_name,
  start_date,
  end_date,
  schedule,
  status,
  created_at,
  updated_at
)
select
  ia.id,
  ia.student_id,
  ia.institution_id,
  ia.course_id,
  ia.municipal_unit_id,
  ia.supervisor_name,
  ia.authorized_start_date,
  ia.authorized_end_date,
  ia.authorized_schedule,
  case
    when ia.authorized_start_date <= current_date then 'em_andamento'
    else 'aguardando_inicio'
  end,
  now(),
  now()
from public.internship_authorizations ia
where not exists (
  select 1
  from public.internships i
  where i.authorization_id = ia.id
);
