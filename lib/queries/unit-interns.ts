import { createClient } from "@/lib/supabase/server";

export type UnitInternAuthorizationRow = {
  id: string;
  student_name: string;
  student_email: string | null;
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

export async function getUnitInternsData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
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
      interns: [] as UnitInternAuthorizationRow[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
      error: "Acesso permitido apenas à unidade municipal ativa.",
    };
  }

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, department, responsible_name")
    .eq("id", profile.municipal_unit_id)
    .single();

  if (unitError || !unit) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
      error: unitError?.message ?? "Unidade municipal não encontrada.",
    };
  }

  const { data: authorizationsData, error: authorizationsError } = await supabase
    .from("internship_authorizations")
    .select(
      "id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, authorized_start_date, authorized_end_date, authorized_schedule, status, notes, created_at",
    )
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("authorized_start_date", { ascending: false });

  if (authorizationsError) {
    return {
      unit,
      interns: [] as UnitInternAuthorizationRow[],
      error: authorizationsError.message,
    };
  }

  const authorizations = authorizationsData ?? [];

  const studentIds = Array.from(
    new Set(authorizations.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(authorizations.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(authorizations.map((item) => item.course_id).filter(Boolean)),
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
      interns: [] as UnitInternAuthorizationRow[],
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

  const interns = authorizations.map((item) => ({
    id: item.id,
    student_name:
      students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    student_email: students.get(item.student_id)?.email ?? null,
    institution_name:
      institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    municipal_unit_name: unit.name,
    supervisor_name: item.supervisor_name,
    authorized_start_date: item.authorized_start_date,
    authorized_end_date: item.authorized_end_date,
    authorized_schedule: item.authorized_schedule,
    status: item.status,
    notes: item.notes,
    created_at: item.created_at,
  })) as UnitInternAuthorizationRow[];

  return {
    unit,
    interns,
    error: null,
  };
}
