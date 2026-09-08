import { createClient } from "@/lib/supabase/server";

export type CoordinationInternshipFilters = {
  status?: string;
  institutionId?: string;
  courseId?: string;
  unitId?: string;
  student?: string;
};

export type CoordinationInternshipFilterOption = {
  id: string;
  name: string;
};

export type CoordinationInternshipCourseOption = {
  id: string;
  name: string;
  institution_id: string | null;
};

export type CoordinationInternshipRow = {
  id: string;
  student_name: string;
  student_email: string | null;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
  status: string;
  occurrence_count: number;
  has_final_report: boolean;
  closing_status: string | null;
};

const allowedStatuses = [
  "aguardando_inicio",
  "em_andamento",
  "suspenso",
  "encerrado",
  "cancelado",
];

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getCoordinationInternshipsData(
  filters: CoordinationInternshipFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      rows: [] as CoordinationInternshipRow[],
      institutions: [] as CoordinationInternshipFilterOption[],
      courses: [] as CoordinationInternshipCourseOption[],
      units: [] as CoordinationInternshipFilterOption[],
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
      rows: [] as CoordinationInternshipRow[],
      institutions: [] as CoordinationInternshipFilterOption[],
      courses: [] as CoordinationInternshipCourseOption[],
      units: [] as CoordinationInternshipFilterOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      rows: [] as CoordinationInternshipRow[],
      institutions: [] as CoordinationInternshipFilterOption[],
      courses: [] as CoordinationInternshipCourseOption[],
      units: [] as CoordinationInternshipFilterOption[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const status = cleanFilter(filters.status);
  const institutionId = cleanFilter(filters.institutionId);
  const courseId = cleanFilter(filters.courseId);
  const unitId = cleanFilter(filters.unitId);
  const student = cleanFilter(filters.student)?.toLowerCase();

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
      rows: [] as CoordinationInternshipRow[],
      institutions: [] as CoordinationInternshipFilterOption[],
      courses: [] as CoordinationInternshipCourseOption[],
      units: [] as CoordinationInternshipFilterOption[],
      error: optionsError,
    };
  }

  let internshipsQuery = supabase
    .from("internships")
    .select("id, authorization_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status, created_at")
    .order("start_date", { ascending: false })
    .limit(200);

  if (status && allowedStatuses.includes(status)) {
    internshipsQuery = internshipsQuery.eq("status", status);
  }

  if (institutionId) {
    internshipsQuery = internshipsQuery.eq("institution_id", institutionId);
  }

  if (courseId) {
    internshipsQuery = internshipsQuery.eq("course_id", courseId);
  }

  if (unitId) {
    internshipsQuery = internshipsQuery.eq("municipal_unit_id", unitId);
  }

  const { data: internshipsData, error: internshipsError } = await internshipsQuery;

  if (internshipsError) {
    return {
      rows: [] as CoordinationInternshipRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationInternshipFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationInternshipCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationInternshipFilterOption[],
      error: internshipsError.message,
    };
  }

  const internships = internshipsData ?? [];

  const studentIds = Array.from(
    new Set(internships.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const internshipIds = Array.from(
    new Set(internships.map((item) => item.id).filter(Boolean)),
  ) as string[];

  const [studentsResult, occurrencesResult, reportsResult] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name, email").in("id", studentIds)
      : { data: [], error: null },

    internshipIds.length > 0
      ? supabase
          .from("internship_occurrences")
          .select("id, internship_id")
          .in("internship_id", internshipIds)
      : { data: [], error: null },

    internshipIds.length > 0
      ? supabase
          .from("final_reports")
          .select("id, internship_id, closing_status")
          .in("internship_id", internshipIds)
      : { data: [], error: null },
  ]);

  const error =
    studentsResult.error?.message ??
    occurrencesResult.error?.message ??
    reportsResult.error?.message ??
    null;

  if (error) {
    return {
      rows: [] as CoordinationInternshipRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationInternshipFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationInternshipCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationInternshipFilterOption[],
      error,
    };
  }

  const students = new Map((studentsResult.data ?? []).map((item) => [item.id, item]));
  const institutions = new Map((institutionsResult.data ?? []).map((item) => [item.id, item]));
  const courses = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const units = new Map((unitsResult.data ?? []).map((item) => [item.id, item]));
  const reports = new Map((reportsResult.data ?? []).map((item) => [item.internship_id, item]));

  const occurrenceCountByInternship = new Map<string, number>();

  for (const occurrence of occurrencesResult.data ?? []) {
    occurrenceCountByInternship.set(
      occurrence.internship_id,
      (occurrenceCountByInternship.get(occurrence.internship_id) ?? 0) + 1,
    );
  }

  let rows = internships.map((item) => {
    const studentInfo = students.get(item.student_id);
    const report = reports.get(item.id);

    return {
      id: item.id,
      student_name: studentInfo?.full_name ?? "Estudante não identificado",
      student_email: studentInfo?.email ?? null,
      institution_name:
        institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
      course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
      municipal_unit_name:
        units.get(item.municipal_unit_id)?.name ?? "Unidade não identificada",
      supervisor_name: item.supervisor_name,
      start_date: item.start_date,
      end_date: item.end_date,
      schedule: item.schedule,
      status: item.status,
      occurrence_count: occurrenceCountByInternship.get(item.id) ?? 0,
      has_final_report: Boolean(report),
      closing_status: report?.closing_status ?? null,
    };
  }) as CoordinationInternshipRow[];

  if (student) {
    rows = rows.filter((item) =>
      item.student_name.toLowerCase().includes(student),
    );
  }

  return {
    rows,
    institutions: (institutionsResult.data ?? []) as CoordinationInternshipFilterOption[],
    courses: (coursesResult.data ?? []) as CoordinationInternshipCourseOption[],
    units: (unitsResult.data ?? []) as CoordinationInternshipFilterOption[],
    error: null,
  };
}
