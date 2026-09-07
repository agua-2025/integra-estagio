import { createClient } from "@/lib/supabase/server";

export type ReadyAuthorizationPresentation = {
  id: string;
  student_id: string;
  student_name: string;
  institution_id: string;
  institution_name: string;
  course_id: string;
  course_name: string;
  agreement_id: string;
  municipal_unit_id: string;
  municipal_unit_name: string;
  supervisor_name: string | null;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
  status: string;
};

export type InternshipAuthorizationRow = {
  id: string;
  presentation_id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  supervisor_name: string;
  authorized_start_date: string;
  authorized_end_date: string | null;
  authorized_schedule: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function getCoordinationAuthorizationsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
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
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const { data: presentationsData, error: presentationsError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, institution_id, course_id, agreement_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload",
    )
    .in("status", ["documentos_validados", "apto_para_autorizacao", "autorizado"])
    .order("created_at", { ascending: false });

  const { data: authorizationsData, error: authorizationsError } = await supabase
    .from("internship_authorizations")
    .select(
      "id, presentation_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, authorized_start_date, authorized_end_date, authorized_schedule, status, notes, created_at",
    )
    .order("created_at", { ascending: false });

  const baseError =
    presentationsError?.message ?? authorizationsError?.message ?? null;

  if (baseError) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error: baseError,
    };
  }

  const presentations = presentationsData ?? [];
  const authorizations = authorizationsData ?? [];

  const studentIds = Array.from(
    new Set([
      ...presentations.map((item) => item.student_id),
      ...authorizations.map((item) => item.student_id),
    ].filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set([
      ...presentations.map((item) => item.institution_id),
      ...authorizations.map((item) => item.institution_id),
    ].filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set([
      ...presentations.map((item) => item.course_id),
      ...authorizations.map((item) => item.course_id),
    ].filter(Boolean)),
  ) as string[];

  const unitIds = Array.from(
    new Set([
      ...presentations.map((item) => item.municipal_unit_id),
      ...authorizations.map((item) => item.municipal_unit_id),
    ].filter(Boolean)),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult, unitsResult] =
    await Promise.all([
      studentIds.length > 0
        ? supabase.from("students").select("id, full_name").in("id", studentIds)
        : { data: [], error: null },

      institutionIds.length > 0
        ? supabase.from("institutions").select("id, name").in("id", institutionIds)
        : { data: [], error: null },

      courseIds.length > 0
        ? supabase.from("courses").select("id, name").in("id", courseIds)
        : { data: [], error: null },

      unitIds.length > 0
        ? supabase
            .from("municipal_units")
            .select("id, name, responsible_name")
            .in("id", unitIds)
        : { data: [], error: null },
    ]);

  const error =
    studentsResult.error?.message ??
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    unitsResult.error?.message ??
    null;

  if (error) {
    return {
      readyPresentations: [] as ReadyAuthorizationPresentation[],
      authorizations: [] as InternshipAuthorizationRow[],
      error,
    };
  }

  const students = new Map(
    (studentsResult.data ?? []).map((item) => [item.id, item]),
  );
  const institutions = new Map(
    (institutionsResult.data ?? []).map((item) => [item.id, item]),
  );
  const courses = new Map(
    (coursesResult.data ?? []).map((item) => [item.id, item]),
  );
  const units = new Map((unitsResult.data ?? []).map((item) => [item.id, item]));

  const authorizedPresentationIds = new Set(
    authorizations.map((item) => item.presentation_id),
  );

  const readyPresentations = presentations
    .filter((item) => !authorizedPresentationIds.has(item.id))
    .filter((item) => item.status !== "autorizado")
    .map((item) => {
      const unit = units.get(item.municipal_unit_id);

      return {
        id: item.id,
        student_id: item.student_id,
        student_name:
          students.get(item.student_id)?.full_name ?? "Estudante não identificado",
        institution_id: item.institution_id,
        institution_name:
          institutions.get(item.institution_id)?.name ??
          "Instituição não identificada",
        course_id: item.course_id,
        course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
        agreement_id: item.agreement_id,
        municipal_unit_id: item.municipal_unit_id,
        municipal_unit_name: unit?.name ?? "Unidade não identificada",
        supervisor_name: unit?.responsible_name ?? null,
        intended_period: item.intended_period,
        intended_schedule: item.intended_schedule,
        required_workload: item.required_workload,
        status: item.status,
      };
    }) as ReadyAuthorizationPresentation[];

  const authorizationRows = authorizations.map((item) => ({
    id: item.id,
    presentation_id: item.presentation_id,
    student_name:
      students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    institution_name:
      institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    municipal_unit_name:
      units.get(item.municipal_unit_id)?.name ?? "Unidade não identificada",
    supervisor_name: item.supervisor_name,
    authorized_start_date: item.authorized_start_date,
    authorized_end_date: item.authorized_end_date,
    authorized_schedule: item.authorized_schedule,
    status: item.status,
    notes: item.notes,
    created_at: item.created_at,
  })) as InternshipAuthorizationRow[];

  return {
    readyPresentations,
    authorizations: authorizationRows,
    error: null,
  };
}
