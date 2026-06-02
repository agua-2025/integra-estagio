-- Integra Estágio
-- 010_conferencia_banco.sql
-- Conferência das tabelas, políticas e buckets criados no Supabase.
-- Este script não altera dados. Apenas consulta a estrutura criada.

-- =========================================================
-- 1. Conferir tabelas principais
-- =========================================================

select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'institutions',
    'institution_contacts',
    'courses',
    'municipal_units',
    'internship_fields',
    'field_courses',
    'inquiries',
    'inquiry_unit_responses',
    'cooperation_agreements',
    'agreement_courses',
    'students',
    'student_presentations',
    'student_documents',
    'internship_authorizations',
    'internships',
    'occurrences',
    'final_reports',
    'audit_logs',
    'notifications'
  )
order by table_name;

-- =========================================================
-- 2. Conferir RLS nas tabelas públicas
-- =========================================================

select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'institutions',
    'institution_contacts',
    'courses',
    'municipal_units',
    'internship_fields',
    'field_courses',
    'inquiries',
    'inquiry_unit_responses',
    'cooperation_agreements',
    'agreement_courses',
    'students',
    'student_presentations',
    'student_documents',
    'internship_authorizations',
    'internships',
    'occurrences',
    'final_reports',
    'audit_logs',
    'notifications'
  )
order by tablename;

-- =========================================================
-- 3. Conferir políticas RLS
-- =========================================================

select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- =========================================================
-- 4. Conferir buckets de Storage
-- =========================================================

select
  id,
  name,
  public,
  created_at,
  updated_at
from storage.buckets
where id in (
  'student-documents',
  'agreement-documents',
  'institution-documents',
  'reports'
)
order by id;

-- =========================================================
-- 5. Conferir funções auxiliares
-- =========================================================

select
  routine_schema,
  routine_name,
  routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'set_updated_at',
    'current_profile_role',
    'current_profile_institution_id',
    'current_profile_municipal_unit_id',
    'is_admin_or_coordenadoria',
    'validate_agreement_inquiry',
    'validate_agreement_course',
    'validate_student_course_institution',
    'validate_student_presentation',
    'validate_internship_authorization',
    'validate_internship_from_authorization',
    'validate_occurrence_internship',
    'validate_final_report_internship'
  )
order by routine_name;

-- =========================================================
-- Fim
-- =========================================================
