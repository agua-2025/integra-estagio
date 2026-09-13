alter table public.commitment_terms
add column if not exists weekly_days text[] not null default '{}';

alter table public.commitment_terms
add column if not exists daily_start_time time;

alter table public.commitment_terms
add column if not exists daily_end_time time;

alter table public.commitment_terms
add column if not exists break_minutes integer not null default 0;

alter table public.commitment_terms
add column if not exists daily_workload numeric(6,2);

alter table public.commitment_terms
add column if not exists weekly_workload numeric(6,2);

alter table public.commitment_terms
add column if not exists maximum_possible_workload numeric(8,2);

alter table public.commitment_terms
drop constraint if exists commitment_terms_break_minutes_check;

alter table public.commitment_terms
add constraint commitment_terms_break_minutes_check check (
  break_minutes >= 0
  and break_minutes <= 240
);

alter table public.commitment_terms
drop constraint if exists commitment_terms_time_order_check;

alter table public.commitment_terms
add constraint commitment_terms_time_order_check check (
  daily_start_time is null
  or daily_end_time is null
  or daily_end_time > daily_start_time
);

alter table public.commitment_terms
drop constraint if exists commitment_terms_weekly_days_check;

alter table public.commitment_terms
add constraint commitment_terms_weekly_days_check check (
  weekly_days <@ array[
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
  ]::text[]
);

create index if not exists idx_commitment_terms_weekly_days
on public.commitment_terms using gin(weekly_days);
