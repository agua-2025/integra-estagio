import { createClient } from "@/lib/supabase/server";

export type CoordinationStudentPresentation = {
  id: string;
  student_name: string;
  student_cpf: string | null;
  student_email: string | null;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  status: string;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
  created_at: string;
};

export async function getCoordinationStudentPresentationsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      presentations: [] as CoordinationStudentPresentation[],
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
      presentations: [] as CoordinationStudentPresentation[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      presentations: [] as CoordinationStudentPresentation[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const { data: rows, error: presentationsError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, institution_id, course_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload, created_at",
    )
    .order("created_at", { ascending: false });

  if (presentationsError) {
    return {
      presentations: [] as CoordinationStudentPresentation[],
      error: presentationsError.message,
    };
  }

  const presentationsRaw = rows ?? [];

  const studentIds = Array.from(
    new Set(presentationsRaw.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(presentationsRaw.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(presentationsRaw.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const unitIds = Array.from(
    new Set(
      presentationsRaw.map((item) => item.municipal_unit_id).filter(Boolean),
    ),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult, unitsResult] =
    await Promise.all([
      studentIds.length > 0
        ? supabase.from("students").select("id, full_name, cpf, email").in("id", studentIds)
        : { data: [], error: null },

      institutionIds.length > 0
        ? supabase.from("institutions").select("id, name").in("id", institutionIds)
        : { data: [], error: null },

      courseIds.length > 0
        ? supabase.from("courses").select("id, name").in("id", courseIds)
        : { data: [], error: null },

      unitIds.length > 0
        ? supabase.from("municipal_units").select("id, name").in("id", unitIds)
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
      presentations: [] as CoordinationStudentPresentation[],
      error,
    };
  }

  const students = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student]),
  );

  const institutions = new Map(
    (institutionsResult.data ?? []).map((institution) => [
      institution.id,
      institution,
    ]),
  );

  const courses = new Map(
    (coursesResult.data ?? []).map((course) => [course.id, course]),
  );

  const units = new Map((unitsResult.data ?? []).map((unit) => [unit.id, unit]));

  const presentations = presentationsRaw.map((item) => {
    const student = students.get(item.student_id);
    const institution = institutions.get(item.institution_id);
    const course = courses.get(item.course_id);
    const unit = item.municipal_unit_id
      ? units.get(item.municipal_unit_id)
      : null;

    return {
      id: item.id,
      student_name: student?.full_name ?? "Estudante não identificado",
      student_cpf: student?.cpf ?? null,
      student_email: student?.email ?? null,
      institution_name: institution?.name ?? "Instituição não identificada",
      course_name: course?.name ?? "Curso não identificado",
      municipal_unit_name: unit?.name ?? "Unidade não definida",
      status: item.status,
      intended_period: item.intended_period,
      intended_schedule: item.intended_schedule,
      required_workload: item.required_workload,
      created_at: item.created_at,
    };
  }) as CoordinationStudentPresentation[];

  return {
    presentations,
    error: null,
  };
}
