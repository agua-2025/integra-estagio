-- 026_add_institution_complementary_fields.sql
-- Acrescenta campos complementares ao cadastro institucional.
-- A solicitação de acesso permanece como triagem inicial.
-- O cadastro institucional passa a conter dados formais da instituição.

alter table public.institutions
add column if not exists legal_name text,
add column if not exists trade_name text,
add column if not exists address_line text,
add column if not exists address_number text,
add column if not exists address_complement text,
add column if not exists neighborhood text,
add column if not exists zip_code text,
add column if not exists legal_representative_name text,
add column if not exists legal_representative_role text,
add column if not exists internship_sector_contact_name text,
add column if not exists internship_sector_contact_email text,
add column if not exists internship_sector_contact_phone text;

select pg_notify('pgrst', 'reload schema');
select pg_notify('pgrst', 'reload config');
