-- Integra Estágio
-- 011_conferencia_resumida.sql
-- Conferência resumida da estrutura criada no Supabase.

select
  'Tabelas públicas criadas' as item,
  count(*)::text as encontrado,
  '20 esperadas' as esperado
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

union all

select
  'Tabelas com RLS ativo' as item,
  count(*)::text as encontrado,
  '20 esperadas' as esperado
from pg_tables
where schemaname = 'public'
  and rowsecurity = true
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

union all

select
  'Políticas RLS públicas' as item,
  count(*)::text as encontrado,
  'várias políticas esperadas' as esperado
from pg_policies
where schemaname = 'public'

union all

select
  'Buckets de storage' as item,
  count(*)::text as encontrado,
  '4 esperados' as esperado
from storage.buckets
where id in (
  'student-documents',
  'agreement-documents',
  'institution-documents',
  'reports'
)

union all

select
  'Funções auxiliares' as item,
  count(*)::text as encontrado,
  '13 esperadas' as esperado
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
  );
