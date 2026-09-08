import { createClient } from "@/lib/supabase/server";

export type InstitutionStudentFilters = {
  status?: string;
  courseId?: string;
  unitId?: string;
  student?: string;
  report?: string;
};

export type InstitutionStudentFilterOption = {
  id: string;
  name: string;
};

export type InstitutionStudentPresentationRow = {
  id: string;
  internship_id: string | null;
  student_name: string;
  student_email: string | null;
  student_cpf: string | null;
  course_name: string;
  municipal_unit_name: string;
  presentation_status: string;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
  review_notes: string | null;
  presented_at: string;
  authorization_status: string | null;
  authorized_start_date: string | null;
  authorized_end_date: string | null;
  authorized_schedule: string | null;
  supervisor_name: string | null;
  authorization_notes: string | null;
  internship_status: string | null;
  final_report_status: string | null;
};

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getInstitutionStudentsData(
  filters: InstitutionStudentFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, institution_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (
    !profile.is_active ||
    profile.role !== "instituicao" ||
    !profile.institution_id
  ) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: "Acesso permitido apenas à instituição ativa.",
    };
  }

  const status = cleanFilter(filters.status);
  const courseId = cleanFilter(filters.courseId);
  const unitId = cleanFilter(filters.unitId);
  const studentFilter = cleanFilter(filters.student)?.toLowerCase();
  const reportFilter = cleanFilter(filters.report);

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select("id, name, status")
    .eq("id", profile.institution_id)
    .single();

  if (institutionError || !institution) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: institutionError?.message ?? "Instituição não encontrada.",
    };
  }

  let presentationsQuery = supabase
    .from("student_presentations")
    .select(
      "id, student_id, course_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload, review_notes, created_at",
    )
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (courseId) {
    presentationsQuery = presentationsQuery.eq("course_id", courseId);
  }

  if (unitId) {
    presentationsQuery = presentationsQuery.eq("municipal_unit_id", unitId);
  }

  const { data: presentationsData, error: presentationsError } =
    await presentationsQuery;

  if (presentationsError) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: presentationsError.message,
    };
  }

  const presentations = presentationsData ?? [];

  const studentIds = Array.from(
    new Set(presentations.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(presentations.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const unitIds = Array.from(
    new Set(presentations.map((item) => item.municipal_unit_id).filter(Boolean)),
  ) as string[];

  const presentationIds = presentations.map((item) => item.id);

  const [studentsResult, coursesResult, unitsResult, authorizationsResult] =
    await Promise.all([
      studentIds.length > 0
        ? supabase
            .from("students")
            .select("id, full_name, cpf, email")
            .in("id", studentIds)
        : { data: [], error: null },

      supabase
        .from("courses")
        .select("id, name")
        .eq("institution_id", profile.institution_id)
        .order("name", { ascending: true }),

      unitIds.length > 0
        ? supabase.from("municipal_units").select("id, name").in("id", unitIds)
        : { data: [], error: null },

      presentationIds.length > 0
        ? supabase
            .from("internship_authorizations")
            .select(
              "id, presentation_id, supervisor_name, authorized_start_date, authorized_end_date, authorized_schedule, status, notes",
            )
            .in("presentation_id", presentationIds)
        : { data: [], error: null },
    ]);

  const baseError =
    studentsResult.error?.message ??
    coursesResult.error?.message ??
    unitsResult.error?.message ??
    authorizationsResult.error?.message ??
    null;

  if (baseError) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: baseError,
    };
  }

  const authorizationIds = Array.from(
    new Set((authorizationsResult.data ?? []).map((item) => item.id)),
  ) as string[];

  const { data: internshipsData, error: internshipsError } =
    authorizationIds.length > 0
      ? await supabase
          .from("internships")
          .select("id, authorization_id, status")
          .in("authorization_id", authorizationIds)
      : { data: [], error: null };

  if (internshipsError) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: internshipsError.message,
    };
  }

  const internshipIds = Array.from(
    new Set((internshipsData ?? []).map((item) => item.id)),
  ) as string[];

  const { data: finalReportsData, error: finalReportsError } =
    internshipIds.length > 0
      ? await supabase
          .from("final_reports")
          .select("id, internship_id, closing_status")
          .in("internship_id", internshipIds)
      : { data: [], error: null };

  if (finalReportsError) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
      courses: [] as InstitutionStudentFilterOption[],
      units: [] as InstitutionStudentFilterOption[],
      error: finalReportsError.message,
    };
  }

  const studentsMap = new Map(
    (studentsResult.data ?? []).map((item) => [item.id, item]),
  );

  const coursesMap = new Map(
    (coursesResult.data ?? []).map((item) => [item.id, item]),
  );

  const unitsMap = new Map(
    (unitsResult.data ?? []).map((item) => [item.id, item]),
  );

  const authorizationsMap = new Map(
    (authorizationsResult.data ?? []).map((item) => [
      item.presentation_id,
      item,
    ]),
  );

  const internshipsMap = new Map(
    (internshipsData ?? []).map((item) => [item.authorization_id, item]),
  );

  const reportsMap = new Map(
    (finalReportsData ?? []).map((item) => [item.internship_id, item]),
  );

  let students = presentations.map((presentation) => {
    const student = studentsMap.get(presentation.student_id);
    const course = coursesMap.get(presentation.course_id);
    const unit = presentation.municipal_unit_id
      ? unitsMap.get(presentation.municipal_unit_id)
      : null;
    const authorization = authorizationsMap.get(presentation.id);
    const internship = authorization
      ? internshipsMap.get(authorization.id)
      : null;
    const finalReport = internship ? reportsMap.get(internship.id) : null;

    return {
      id: presentation.id,
      internship_id: internship?.id ?? null,
      student_name: student?.full_name ?? "Estudante não identificado",
      student_email: student?.email ?? null,
      student_cpf: student?.cpf ?? null,
      course_name: course?.name ?? "Curso não identificado",
      municipal_unit_name: unit?.name ?? "Unidade não definida",
      presentation_status: presentation.status,
      intended_period: presentation.intended_period,
      intended_schedule: presentation.intended_schedule,
      required_workload: presentation.required_workload,
      review_notes: presentation.review_notes,
      presented_at: presentation.created_at,
      authorization_status: authorization?.status ?? null,
      authorized_start_date: authorization?.authorized_start_date ?? null,
      authorized_end_date: authorization?.authorized_end_date ?? null,
      authorized_schedule: authorization?.authorized_schedule ?? null,
      supervisor_name: authorization?.supervisor_name ?? null,
      authorization_notes: authorization?.notes ?? null,
      internship_status: internship?.status ?? null,
      final_report_status: finalReport?.closing_status ?? null,
    };
  }) as InstitutionStudentPresentationRow[];

  if (studentFilter) {
    students = students.filter((item) =>
      item.student_name.toLowerCase().includes(studentFilter),
    );
  }

  if (status === "em_analise") {
    students = students.filter((item) =>
      ["apresentado", "em_analise", "pendente_correcao"].includes(
        item.presentation_status,
      ),
    );
  }

  if (status === "pronto") {
    students = students.filter((item) =>
      ["documentos_validados", "apto_para_autorizacao"].includes(
        item.presentation_status,
      ),
    );
  }

  if (status === "autorizado") {
    students = students.filter((item) => item.authorization_status === "autorizado");
  }

  if (status === "em_andamento") {
    students = students.filter((item) => item.internship_status === "em_andamento");
  }

  if (status === "encerrado") {
    students = students.filter((item) => item.internship_status === "encerrado");
  }

  if (status === "indeferido_cancelado") {
    students = students.filter((item) =>
      ["indeferido", "cancelado"].includes(item.presentation_status),
    );
  }

  if (reportFilter === "registrado") {
    students = students.filter((item) => Boolean(item.final_report_status));
  }

  if (reportFilter === "pendente") {
    students = students.filter(
      (item) => Boolean(item.internship_id) && !item.final_report_status,
    );
  }

  return {
    institution,
    students,
    courses: (coursesResult.data ?? []) as InstitutionStudentFilterOption[],
    units: (unitsResult.data ?? []) as InstitutionStudentFilterOption[],
    error: null,
  };
}
