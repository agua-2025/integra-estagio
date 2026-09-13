-- Integra Estágio
-- 045_create_agreement_documents_bucket.sql
-- Bucket para armazenamento dos PDFs assinados dos Acordos de Cooperação.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'agreement-documents',
  'agreement-documents',
  true,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "agreement_documents_select_authenticated" on storage.objects;
drop policy if exists "agreement_documents_insert_coordination" on storage.objects;
drop policy if exists "agreement_documents_update_coordination" on storage.objects;
drop policy if exists "agreement_documents_delete_coordination" on storage.objects;

create policy "agreement_documents_select_authenticated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'agreement-documents'
);

create policy "agreement_documents_insert_coordination"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'agreement-documents'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin', 'coordenadoria')
  )
);

create policy "agreement_documents_update_coordination"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'agreement-documents'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin', 'coordenadoria')
  )
)
with check (
  bucket_id = 'agreement-documents'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin', 'coordenadoria')
  )
);

create policy "agreement_documents_delete_coordination"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'agreement-documents'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.role in ('admin', 'coordenadoria')
  )
);
