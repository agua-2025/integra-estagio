alter table public.students
add column if not exists identity_document text;

alter table public.students
add column if not exists identity_issuer text;

alter table public.students
add column if not exists address text;

create index if not exists idx_students_identity_document
on public.students(identity_document);
