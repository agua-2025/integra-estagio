alter table public.cooperation_agreements
  add column if not exists institution_review_status text
    check (
      institution_review_status is null
      or institution_review_status in (
        'aguardando_conferencia',
        'aprovada',
        'correcao_solicitada'
      )
    ),
  add column if not exists institution_review_notes text,
  add column if not exists institution_reviewed_at timestamptz,
  add column if not exists institution_reviewed_by uuid references public.profiles(id) on delete set null;
