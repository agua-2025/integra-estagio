-- Integra Estágio
-- 009_storage_documentos.sql
-- Buckets privados e políticas iniciais para documentos.

-- =========================================================
-- Buckets privados
-- =========================================================

insert into storage.buckets (id, name, public)
values
  ('student-documents', 'student-documents', false),
  ('agreement-documents', 'agreement-documents', false),
  ('institution-documents', 'institution-documents', false),
  ('reports', 'reports', false)
on conflict (id) do update
set public = false;

-- =========================================================
-- Limpeza de políticas anteriores
-- =========================================================

drop policy if exists "storage_documents_select_policy" on storage.objects;
drop policy if exists "storage_documents_insert_policy" on storage.objects;
drop policy if exists "storage_documents_update_policy" on storage.objects;
drop policy if exists "storage_documents_delete_policy" on storage.objects;

-- =========================================================
-- SELECT
-- =========================================================
-- Regra inicial conservadora:
-- - Coordenadoria/Admin pode visualizar arquivos dos buckets do sistema;
-- - usuário autenticado pode visualizar arquivos enviados por ele mesmo.

create policy "storage_documents_select_policy"
on storage.objects
for select
to authenticated
using (
  bucket_id in (
    'student-documents',
    'agreement-documents',
    'institution-documents',
    'reports'
  )
  and (
    public.is_admin_or_coordenadoria()
    or owner = auth.uid()
  )
);

-- =========================================================
-- INSERT
-- =========================================================
-- Regra inicial:
-- - qualquer usuário autenticado pode enviar arquivo para os buckets privados;
-- - a aplicação deverá gravar o caminho correto e vincular o arquivo à tabela correspondente.

create policy "storage_documents_insert_policy"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'student-documents',
    'agreement-documents',
    'institution-documents',
    'reports'
  )
);

-- =========================================================
-- UPDATE
-- =========================================================

create policy "storage_documents_update_policy"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'student-documents',
    'agreement-documents',
    'institution-documents',
    'reports'
  )
  and (
    public.is_admin_or_coordenadoria()
    or owner = auth.uid()
  )
)
with check (
  bucket_id in (
    'student-documents',
    'agreement-documents',
    'institution-documents',
    'reports'
  )
  and (
    public.is_admin_or_coordenadoria()
    or owner = auth.uid()
  )
);

-- =========================================================
-- DELETE
-- =========================================================

create policy "storage_documents_delete_policy"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'student-documents',
    'agreement-documents',
    'institution-documents',
    'reports'
  )
  and (
    public.is_admin_or_coordenadoria()
    or owner = auth.uid()
  )
);

-- =========================================================
-- Fim
-- =========================================================
