insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-documents',
  'student-documents',
  true,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "student_documents_storage_select_policy" on storage.objects;
drop policy if exists "student_documents_storage_insert_policy" on storage.objects;
drop policy if exists "student_documents_storage_update_policy" on storage.objects;
drop policy if exists "student_documents_storage_delete_policy" on storage.objects;

create policy "student_documents_storage_select_policy"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
);

create policy "student_documents_storage_insert_policy"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-documents'
  and (
    public.is_admin_or_coordenadoria()
    or public.current_profile_institution_id() is not null
  )
);

create policy "student_documents_storage_update_policy"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-documents'
  and (
    public.is_admin_or_coordenadoria()
    or public.current_profile_institution_id() is not null
  )
)
with check (
  bucket_id = 'student-documents'
  and (
    public.is_admin_or_coordenadoria()
    or public.current_profile_institution_id() is not null
  )
);

create policy "student_documents_storage_delete_policy"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-documents'
  and public.is_admin_or_coordenadoria()
);
