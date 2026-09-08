import { createClient } from "@/lib/supabase/server";

export type CoordinationInternshipDetail = {
  id: string;
  authorization_id: string;
  student_id: string;
  student_name: string;
  student_email: string | null;
  student_cpf: string | null;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
  status: string;
  authorization: {
    id: string;
    authorized_start_date: string;
    authorized_end_date: string | null;
    authorized_schedule: string | null;
    status: string;
    notes: string | null;
    created_at: string;
  } | null;
  occurrences: {
    id: string;
    occurrence_type: string;
    occurrence_date: string;
    description: string;
    status: string;
    resolution_notes: string | null;
    created_at: string;
  }[];
  final_report: {
    id: string;
    performed_period: string;
    completed_workload: number | null;
    activities_summary: string;
    supervisor_notes: string | null;
    closing_status: string;
    created_at: string;
  } | null;
};

export async function getCoordinationInternshipDetail(internshipId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      detail: null,
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      detail: null,
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      detail: null,
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select("id, authorization_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status")
    .eq("id", internshipId)
    .single();

  if (internshipError || !internship) {
    return {
      detail: null,
      error: internshipError?.message ?? "Estágio não encontrado.",
    };
  }

  const [
    studentResult,
    institutionResult,
    courseResult,
    unitResult,
    authorizationResult,
    occurrencesResult,
    finalReportResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, email, cpf")
      .eq("id", internship.student_id)
      .single(),

    supabase
      .from("institutions")
      .select("id, name")
      .eq("id", internship.institution_id)
      .single(),

    supabase
      .from("courses")
      .select("id, name")
      .eq("id", internship.course_id)
      .single(),

    supabase
      .from("municipal_units")
      .select("id, name")
      .eq("id", internship.municipal_unit_id)
      .single(),

    supabase
      .from("internship_authorizations")
      .select("id, authorized_start_date, authorized_end_date, authorized_schedule, status, notes, created_at")
      .eq("id", internship.authorization_id)
      .maybeSingle(),

    supabase
      .from("internship_occurrences")
      .select("id, occurrence_type, occurrence_date, description, status, resolution_notes, created_at")
      .eq("internship_id", internship.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("final_reports")
      .select("id, performed_period, completed_workload, activities_summary, supervisor_notes, closing_status, created_at")
      .eq("internship_id", internship.id)
      .maybeSingle(),
  ]);

  const error =
    studentResult.error?.message ??
    institutionResult.error?.message ??
    courseResult.error?.message ??
    unitResult.error?.message ??
    authorizationResult.error?.message ??
    occurrencesResult.error?.message ??
    finalReportResult.error?.message ??
    null;

  if (error) {
    return {
      detail: null,
      error,
    };
  }

  const detail = {
    id: internship.id,
    authorization_id: internship.authorization_id,
    student_id: internship.student_id,
    student_name: studentResult.data?.full_name ?? "Estudante não identificado",
    student_email: studentResult.data?.email ?? null,
    student_cpf: studentResult.data?.cpf ?? null,
    institution_name: institutionResult.data?.name ?? "Instituição não identificada",
    course_name: courseResult.data?.name ?? "Curso não identificado",
    municipal_unit_name: unitResult.data?.name ?? "Unidade não identificada",
    supervisor_name: internship.supervisor_name,
    start_date: internship.start_date,
    end_date: internship.end_date,
    schedule: internship.schedule,
    status: internship.status,
    authorization: authorizationResult.data
      ? {
          id: authorizationResult.data.id,
          authorized_start_date: authorizationResult.data.authorized_start_date,
          authorized_end_date: authorizationResult.data.authorized_end_date,
          authorized_schedule: authorizationResult.data.authorized_schedule,
          status: authorizationResult.data.status,
          notes: authorizationResult.data.notes,
          created_at: authorizationResult.data.created_at,
        }
      : null,
    occurrences: occurrencesResult.data ?? [],
    final_report: finalReportResult.data
      ? {
          id: finalReportResult.data.id,
          performed_period: finalReportResult.data.performed_period,
          completed_workload: finalReportResult.data.completed_workload,
          activities_summary: finalReportResult.data.activities_summary,
          supervisor_notes: finalReportResult.data.supervisor_notes,
          closing_status: finalReportResult.data.closing_status,
          created_at: finalReportResult.data.created_at,
        }
      : null,
  } as CoordinationInternshipDetail;

  return {
    detail,
    error: null,
  };
}
