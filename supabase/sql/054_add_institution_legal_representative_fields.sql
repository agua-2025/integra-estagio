alter table public.institutions
  add column if not exists legal_representative_cpf text,
  add column if not exists legal_representative_rg text,
  add column if not exists legal_representative_rg_issuer text,
  add column if not exists legal_representative_email text,
  add column if not exists legal_representative_phone text;
