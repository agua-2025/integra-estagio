alter table public.commitment_terms
add column if not exists term_number text;

alter table public.commitment_terms
add column if not exists term_signed_at date;

alter table public.commitment_terms
add column if not exists internship_type text not null default 'obrigatorio';

alter table public.commitment_terms
add column if not exists academic_period text;

alter table public.commitment_terms
add column if not exists professor_advisor_name text;

alter table public.commitment_terms
add column if not exists professor_advisor_email text;

alter table public.commitment_terms
add column if not exists internship_location text;

alter table public.commitment_terms
add column if not exists activities_plan text;

alter table public.commitment_terms
drop constraint if exists commitment_terms_internship_type_check;

alter table public.commitment_terms
add constraint commitment_terms_internship_type_check check (
  internship_type in ('obrigatorio', 'nao_obrigatorio')
);

alter table public.commitment_terms
drop constraint if exists commitment_terms_daily_limit_check;

alter table public.commitment_terms
add constraint commitment_terms_daily_limit_check check (
  daily_workload is null
  or daily_workload <= 6
);

alter table public.commitment_terms
drop constraint if exists commitment_terms_weekly_limit_check;

alter table public.commitment_terms
add constraint commitment_terms_weekly_limit_check check (
  weekly_workload is null
  or weekly_workload <= 30
);

create index if not exists idx_commitment_terms_term_number
on public.commitment_terms(term_number);

create index if not exists idx_commitment_terms_internship_type
on public.commitment_terms(internship_type);
