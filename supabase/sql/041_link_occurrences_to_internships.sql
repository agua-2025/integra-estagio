-- Integra Estágio
-- 041_link_occurrences_to_internships.sql
-- Vincula ocorrências ao estágio em acompanhamento, centralizado em internships.

alter table public.internship_occurrences
add column if not exists internship_id uuid references public.internships(id) on delete cascade;

update public.internship_occurrences io
set internship_id = i.id
from public.internships i
where io.internship_id is null
  and io.authorization_id = i.authorization_id;

alter table public.internship_occurrences
alter column internship_id set not null;

create index if not exists internship_occurrences_internship_id_idx
on public.internship_occurrences(internship_id);
