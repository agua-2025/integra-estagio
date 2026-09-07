import { createClient } from "@/lib/supabase/server";

export type UnitFinalReportFilters = {
  status?: string;
  courseId?: string;
  student?: string;
};

export type UnitFinalReportCourseOption = {
  id: string;
  name: string;
};

export type UnitFinalReportInternRow = {
  id: string;
  student_name: string;
  student_email: string | null;
  institution_name: string;
  course_name: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
  internship_status: string;
  has_report: boolean;
  report_id: string | null;
  closing_status: string | null;
  completed_workload: number | null;
  report_created_at: string | null;
};

export type UnitFinalReportDetail = {
  id: string;
  student_name: string;
  student_email: string | null;
  institution_name: string;
  course_name: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
  status: string;
  report: {
    id: string;
    performed_period: string;
    completed_workload: number | null;
    activities_summary: string;
    supervisor_notes: string | null;
    closing_status: string;
    created_at: string;
  } | null;
};

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

async function getUnitProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
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
      supabase,
      user,
      profile: null,
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    return {
      supabase,
      user,
      profile,
      error: "Acesso permitido apenas à unidade municipal ativa.",
    };
  }

  return {
    supabase,
    user,
    profile,
    error: null,
  };
}

export async function getUnitFinalReportsData(
  filters: UnitFinalReportFilters = {},
) {
  const { supabase, profile, error: profileError } = await getUnitProfile();

  if (profileError || !profile?.municipal_unit_id) {
    return {
      unit: null,
      rows: [] as UnitFinalReportInternRow[],
      courses: [] as UnitFinalReportCourseOption[],
      error: profileError,
    };
  }

  const status = cleanFilter(filters.status);
  const courseId = cleanFilter(filters.courseId);
  const student = cleanFilter(filters.student)?.toLowerCase();

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, responsible_name")
    .eq("id", profile.municipal_unit_id)
    .single();

  if (unitError || !unit) {
    return {
      unit: null,
      rows: [] as UnitFinalReportInternRow[],
      courses: [] as UnitFinalReportCourseOption[],
      error: unitError?.message ?? "Unidade municipal não encontrada.",
    };
  }

  let internshipsQuery = supabase
    .from("internships")
    .select("id, student_id, institution_id, course_id, supervisor_name, start_date, end_date, schedule, status, created_at")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("start_date", { ascending: false })
    .limit(200);

  if (courseId) {
    internshipsQuery = internshipsQuery.eq("course_id", courseId);
  }

  const { data: internshipsData, error: internshipsError } = await internshipsQuery;

  const { data: reportsData, error: reportsError } = await supabase
    .from("final_reports")
    .select("id, internship_id, closing_status, completed_workload, created_at")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("created_at", { ascending: false });

  const baseError = internshipsError?.message ?? reportsError?.message ?? null;

  if (baseError) {
    return {
      unit,
      rows: [] as UnitFinalReportInternRow[],
      courses: [] as UnitFinalReportCourseOption[],
      error: baseError,
    };
  }

  const internships = internshipsData ?? [];
  const reports = reportsData ?? [];

  const studentIds = Array.from(
    new Set(internships.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(internships.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(internships.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name, email").in("id", studentIds)
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
      rows: [] as UnitFinalReportInternRow[],
      courses: [] as UnitFinalReportCourseOption[],
      error,
    };
  }

  const students = new Map((studentsResult.data ?? []).map((item) => [item.id, item]));
  const institutions = new Map((institutionsResult.data ?? []).map((item) => [item.id, item]));
  const courses = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));
  const reportsByInternship = new Map(reports.map((item) => [item.internship_id, item]));

  let rows = internships.map((item) => {
    const report = reportsByInternship.get(item.id);
    const studentInfo = students.get(item.student_id);

    return {
      id: item.id,
      student_name: studentInfo?.full_name ?? "Estudante não identificado",
      student_email: studentInfo?.email ?? null,
      institution_name:
        institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
      course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
      supervisor_name: item.supervisor_name,
      start_date: item.start_date,
      end_date: item.end_date,
      schedule: item.schedule,
      internship_status: item.status,
      has_report: Boolean(report),
      report_id: report?.id ?? null,
      closing_status: report?.closing_status ?? null,
      completed_workload: report?.completed_workload ?? null,
      report_created_at: report?.created_at ?? null,
    };
  }) as UnitFinalReportInternRow[];

  if (status === "pendente") {
    rows = rows.filter((item) => !item.has_report && ["em_andamento", "suspenso"].includes(item.internship_status));
  }

  if (status === "finalizado") {
    rows = rows.filter((item) => item.has_report);
  }

  if (student) {
    rows = rows.filter((item) =>
      item.student_name.toLowerCase().includes(student),
    );
  }

  return {
    unit,
    rows,
    courses: (coursesResult.data ?? []) as UnitFinalReportCourseOption[],
    error: null,
  };
}

export async function getUnitFinalReportDetail(internshipId: string) {
  const { supabase, profile, error: profileError } = await getUnitProfile();

  if (profileError || !profile?.municipal_unit_id) {
    return {
      detail: null,
      error: profileError,
    };
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select("id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status")
    .eq("id", internshipId)
    .single();

  if (internshipError || !internship) {
    return {
      detail: null,
      error: internshipError?.message ?? "Estágio não encontrado.",
    };
  }

  if (internship.municipal_unit_id !== profile.municipal_unit_id) {
    return {
      detail: null,
      error: "Este estágio não pertence à sua unidade.",
    };
  }

  const [studentResult, institutionResult, courseResult, reportResult] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, email")
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
        .from("final_reports")
        .select("id, performed_period, completed_workload, activities_summary, supervisor_notes, closing_status, created_at")
        .eq("internship_id", internship.id)
        .maybeSingle(),
    ]);

  const error =
    studentResult.error?.message ??
    institutionResult.error?.message ??
    courseResult.error?.message ??
    reportResult.error?.message ??
    null;

  if (error) {
    return {
      detail: null,
      error,
    };
  }

  const detail = {
    id: internship.id,
    student_name: studentResult.data?.full_name ?? "Estudante não identificado",
    student_email: studentResult.data?.email ?? null,
    institution_name: institutionResult.data?.name ?? "Instituição não identificada",
    course_name: courseResult.data?.name ?? "Curso não identificado",
    supervisor_name: internship.supervisor_name,
    start_date: internship.start_date,
    end_date: internship.end_date,
    schedule: internship.schedule,
    status: internship.status,
    report: reportResult.data
      ? {
          id: reportResult.data.id,
          performed_period: reportResult.data.performed_period,
          completed_workload: reportResult.data.completed_workload,
          activities_summary: reportResult.data.activities_summary,
          supervisor_notes: reportResult.data.supervisor_notes,
          closing_status: reportResult.data.closing_status,
          created_at: reportResult.data.created_at,
        }
      : null,
  } as UnitFinalReportDetail;

  return {
    detail,
    error: null,
  };
}
