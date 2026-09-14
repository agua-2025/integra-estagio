alter table public.cooperation_agreements
  add column if not exists draft_text text,
  add column if not exists draft_generated_at timestamptz,
  add column if not exists draft_generated_by uuid references public.profiles(id) on delete set null;
