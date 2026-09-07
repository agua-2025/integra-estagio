import { createClient } from "@/lib/supabase/server";

export type CoordinationFinalReportFilters = {
  status?: string;
  institutionId?: string;
  courseId?: string;
  unitId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CoordinationFinalReportFilterOption = {
  id: string;
  name: string;
};

export type CoordinationFinalReportCourseOption = {
  id: string;
  name: string;
  institution_id: string | null;
};

export type CoordinationFinalReportRow = {
  id: string;
  internship_id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  supervisor_name: string;
  performed_period: string;
  completed_workload: number | null;
  activities_summary: string;
  supervisor_notes: string | null;
  closing_status: string;
  created_at: string;
};

const allowedStatuses = [
  "concluido",
  "concluido_com_observacao",
  "encerrado_antecipadamente",
];

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getCoordinationFinalReportsData(
  filters: CoordinationFinalReportFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: [] as CoordinationFinalReportFilterOption[],
      courses: [] as CoordinationFinalReportCourseOption[],
      units: [] as CoordinationFinalReportFilterOption[],
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
      reports: [] as CoordinationFinalReportRow[],
      institutions: [] as CoordinationFinalReportFilterOption[],
      courses: [] as CoordinationFinalReportCourseOption[],
      units: [] as CoordinationFinalReportFilterOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: [] as CoordinationFinalReportFilterOption[],
      courses: [] as CoordinationFinalReportCourseOption[],
      units: [] as CoordinationFinalReportFilterOption[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const status = cleanFilter(filters.status);
  const institutionId = cleanFilter(filters.institutionId);
  const courseId = cleanFilter(filters.courseId);
  const unitId = cleanFilter(filters.unitId);
  const dateFrom = cleanFilter(filters.dateFrom);
  const dateTo = cleanFilter(filters.dateTo);

  const [institutionsResult, coursesResult, unitsResult] = await Promise.all([
    supabase
      .from("institutions")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("courses")
      .select("id, name, institution_id")
      .order("name", { ascending: true }),

    supabase
      .from("municipal_units")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const optionsError =
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    unitsResult.error?.message ??
    null;

  if (optionsError) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: [] as CoordinationFinalReportFilterOption[],
      courses: [] as CoordinationFinalReportCourseOption[],
      units: [] as CoordinationFinalReportFilterOption[],
      error: optionsError,
    };
  }

  let reportQuery = supabase
    .from("final_reports")
    .select(
      "id, internship_id, student_id, municipal_unit_id, supervisor_name, performed_period, completed_workload, activities_summary, supervisor_notes, closing_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && allowedStatuses.includes(status)) {
    reportQuery = reportQuery.eq("closing_status", status);
  }

  if (unitId) {
    reportQuery = reportQuery.eq("municipal_unit_id", unitId);
  }

  if (dateFrom) {
    reportQuery = reportQuery.gte("created_at", `${dateFrom}T00:00:00`);
  }

  if (dateTo) {
    reportQuery = reportQuery.lte("created_at", `${dateTo}T23:59:59`);
  }

  const { data: reportsData, error: reportsError } = await reportQuery;

  if (reportsError) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationFinalReportCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      error: reportsError.message,
    };
  }

  const reports = reportsData ?? [];
  const internshipIds = Array.from(
    new Set(reports.map((item) => item.internship_id).filter(Boolean)),
  ) as string[];

  const { data: internshipsData, error: internshipsError } =
    internshipIds.length > 0
      ? await supabase
          .from("internships")
          .select("id, student_id, institution_id, course_id, municipal_unit_id")
          .in("id", internshipIds)
      : { data: [], error: null };

  if (internshipsError) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationFinalReportCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      error: internshipsError.message,
    };
  }

  let internships = internshipsData ?? [];

  if (institutionId) {
    internships = internships.filter((item) => item.institution_id === institutionId);
  }

  if (courseId) {
    internships = internships.filter((item) => item.course_id === courseId);
  }

  const allowedInternshipIds = new Set(internships.map((item) => item.id));

  const filteredReports =
    institutionId || courseId
      ? reports.filter((item) => allowedInternshipIds.has(item.internship_id))
      : reports;

  const studentIds = Array.from(
    new Set(internships.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const [studentsResult] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name").in("id", studentIds)
      : { data: [], error: null },
  ]);

  if (studentsResult.error) {
    return {
      reports: [] as CoordinationFinalReportRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationFinalReportCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationFinalReportFilterOption[],
      error: studentsResult.error.message,
    };
  }

  const students = new Map((studentsResult.data ?? []).map((item) => [item.id, item]));
  const internshipsMap = new Map(internships.map((item) => [item.id, item]));
  const institutions = new Map(
    (institutionsResult.data ?? []).map((item) => [item.id, item]),
  );
  const courses = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const units = new Map((unitsResult.data ?? []).map((item) => [item.id, item]));

  const reportRows = filteredReports.map((item) => {
    const internship = internshipsMap.get(item.internship_id);

    return {
      id: item.id,
      internship_id: item.internship_id,
      student_name: internship
        ? students.get(internship.student_id)?.full_name ?? "Estudante não identificado"
        : "Estudante não identificado",
      institution_name: internship
        ? institutions.get(internship.institution_id)?.name ?? "Instituição não identificada"
        : "Instituição não identificada",
      course_name: internship
        ? courses.get(internship.course_id)?.name ?? "Curso não identificado"
        : "Curso não identificado",
      municipal_unit_name: internship
        ? units.get(internship.municipal_unit_id)?.name ?? "Unidade não identificada"
        : "Unidade não identificada",
      supervisor_name: item.supervisor_name,
      performed_period: item.performed_period,
      completed_workload: item.completed_workload,
      activities_summary: item.activities_summary,
      supervisor_notes: item.supervisor_notes,
      closing_status: item.closing_status,
      created_at: item.created_at,
    };
  }) as CoordinationFinalReportRow[];

  return {
    reports: reportRows,
    institutions: (institutionsResult.data ?? []) as CoordinationFinalReportFilterOption[],
    courses: (coursesResult.data ?? []) as CoordinationFinalReportCourseOption[],
    units: (unitsResult.data ?? []) as CoordinationFinalReportFilterOption[],
    error: null,
  };
}
