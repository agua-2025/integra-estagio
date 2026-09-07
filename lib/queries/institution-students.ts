import { createClient } from "@/lib/supabase/server";

export type InstitutionStudentPresentationRow = {
  id: string;
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
};

export async function getInstitutionStudentsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
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
      error: "Acesso permitido apenas à instituição ativa.",
    };
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select("id, name, status")
    .eq("id", profile.institution_id)
    .single();

  if (institutionError || !institution) {
    return {
      institution: null,
      students: [] as InstitutionStudentPresentationRow[],
      error: institutionError?.message ?? "Instituição não encontrada.",
    };
  }

  const { data: presentationsData, error: presentationsError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, course_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload, review_notes, created_at",
    )
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false });

  if (presentationsError) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
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

      courseIds.length > 0
        ? supabase.from("courses").select("id, name").in("id", courseIds)
        : { data: [], error: null },

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

  const error =
    studentsResult.error?.message ??
    coursesResult.error?.message ??
    unitsResult.error?.message ??
    authorizationsResult.error?.message ??
    null;

  if (error) {
    return {
      institution,
      students: [] as InstitutionStudentPresentationRow[],
      error,
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

  const students = presentations.map((presentation) => {
    const student = studentsMap.get(presentation.student_id);
    const course = coursesMap.get(presentation.course_id);
    const unit = presentation.municipal_unit_id
      ? unitsMap.get(presentation.municipal_unit_id)
      : null;
    const authorization = authorizationsMap.get(presentation.id);

    return {
      id: presentation.id,
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
    };
  }) as InstitutionStudentPresentationRow[];

  return {
    institution,
    students,
    error: null,
  };
}
