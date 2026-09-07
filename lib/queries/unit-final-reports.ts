import { createClient } from "@/lib/supabase/server";

export type UnitFinalReportInternOption = {
  id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
};

export type UnitFinalReportRow = {
  id: string;
  internship_id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  supervisor_name: string;
  performed_period: string;
  completed_workload: number | null;
  activities_summary: string;
  supervisor_notes: string | null;
  closing_status: string;
  created_at: string;
};

export async function getUnitFinalReportsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      unit: null,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, municipal_unit_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      unit: null,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    return {
      unit: null,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error: "Acesso permitido apenas à unidade municipal ativa.",
    };
  }

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, responsible_name")
    .eq("id", profile.municipal_unit_id)
    .single();

  if (unitError || !unit) {
    return {
      unit: null,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error: unitError?.message ?? "Unidade municipal não encontrada.",
    };
  }

  const { data: internshipsData, error: internshipsError } = await supabase
    .from("internships")
    .select("id, student_id, institution_id, course_id, supervisor_name, start_date, end_date, schedule, status")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .in("status", ["aguardando_inicio", "em_andamento", "suspenso", "encerrado"])
    .order("start_date", { ascending: false });

  const { data: reportsData, error: reportsError } = await supabase
    .from("final_reports")
    .select("id, internship_id, student_id, municipal_unit_id, supervisor_name, performed_period, completed_workload, activities_summary, supervisor_notes, closing_status, created_at")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("created_at", { ascending: false });

  const baseError = internshipsError?.message ?? reportsError?.message ?? null;

  if (baseError) {
    return {
      unit,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error: baseError,
    };
  }

  const internships = internshipsData ?? [];
  const reports = reportsData ?? [];

  const reportedInternshipIds = new Set(reports.map((item) => item.internship_id));

  const studentIds = Array.from(
    new Set([
      ...internships.map((item) => item.student_id),
      ...reports.map((item) => item.student_id),
    ].filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(internships.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(internships.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name").in("id", studentIds)
      : { data: [], error: null },

    institutionIds.length > 0
      ? supabase.from("institutions").select("id, name").in("id", institutionIds)
      : { data: [], error: null },

    courseIds.length > 0
      ? supabase.from("courses").select("id, name").in("id", courseIds)
      : { data: [], error: null },
  ]);

  const error =
    studentsResult.error?.message ??
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    null;

  if (error) {
    return {
      unit,
      internOptions: [] as UnitFinalReportInternOption[],
      reports: [] as UnitFinalReportRow[],
      error,
    };
  }

  const students = new Map((studentsResult.data ?? []).map((item) => [item.id, item]));
  const institutions = new Map((institutionsResult.data ?? []).map((item) => [item.id, item]));
  const courses = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const internshipsMap = new Map(internships.map((item) => [item.id, item]));

  const internOptions = internships
    .filter((item) => !reportedInternshipIds.has(item.id))
    .filter((item) => ["em_andamento", "suspenso"].includes(item.status))
    .map((item) => ({
      id: item.id,
      student_name: students.get(item.student_id)?.full_name ?? "Estudante não identificado",
      institution_name: institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
      course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
      supervisor_name: item.supervisor_name,
      start_date: item.start_date,
      end_date: item.end_date,
      schedule: item.schedule,
    })) as UnitFinalReportInternOption[];

  const reportRows = reports.map((item) => {
    const internship = internshipsMap.get(item.internship_id);

    return {
      id: item.id,
      internship_id: item.internship_id,
      student_name: students.get(item.student_id)?.full_name ?? "Estudante não identificado",
      institution_name: internship
        ? institutions.get(internship.institution_id)?.name ?? "Instituição não identificada"
        : "Instituição não identificada",
      course_name: internship
        ? courses.get(internship.course_id)?.name ?? "Curso não identificado"
        : "Curso não identificado",
      supervisor_name: item.supervisor_name,
      performed_period: item.performed_period,
      completed_workload: item.completed_workload,
      activities_summary: item.activities_summary,
      supervisor_notes: item.supervisor_notes,
      closing_status: item.closing_status,
      created_at: item.created_at,
    };
  }) as UnitFinalReportRow[];

  return {
    unit,
    internOptions,
    reports: reportRows,
    error: null,
  };
}
