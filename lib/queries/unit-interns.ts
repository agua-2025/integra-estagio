import { createClient } from "@/lib/supabase/server";

export type UnitInternFilters = {
  status?: string;
  institution?: string;
  course?: string;
  student?: string;
};

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

export type UnitInternOption = {
  id: string;
  name: string;
};

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getUnitInternsData(filters: UnitInternFilters = {}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
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
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
      error: "Acesso permitido apenas à unidade municipal ativa.",
    };
  }

  const status = cleanFilter(filters.status);
  const institutionFilter = cleanFilter(filters.institution);
  const courseFilter = cleanFilter(filters.course);
  const studentFilter = cleanFilter(filters.student)?.toLowerCase();

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, department, responsible_name")
    .eq("id", profile.municipal_unit_id)
    .single();

  if (unitError || !unit) {
    return {
      unit: null,
      interns: [] as UnitInternAuthorizationRow[],
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
      error: unitError?.message ?? "Unidade municipal não encontrada.",
    };
  }

  let internshipsQuery = supabase
    .from("internships")
    .select(
      "id, authorization_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status, created_at",
    )
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("start_date", { ascending: false })
    .limit(200);

  if (status) {
    internshipsQuery = internshipsQuery.eq("status", status);
  }

  if (institutionFilter) {
    internshipsQuery = internshipsQuery.eq("institution_id", institutionFilter);
  }

  if (courseFilter) {
    internshipsQuery = internshipsQuery.eq("course_id", courseFilter);
  }

  const { data: internshipsData, error: internshipsError } =
    await internshipsQuery;

  if (internshipsError) {
    return {
      unit,
      interns: [] as UnitInternAuthorizationRow[],
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
      error: internshipsError.message,
    };
  }

  const internships = internshipsData ?? [];

  const studentIds = Array.from(
    new Set(internships.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(internships.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(internships.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const authorizationIds = Array.from(
    new Set(internships.map((item) => item.authorization_id).filter(Boolean)),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult, authorizationsResult] =
    await Promise.all([
      studentIds.length > 0
        ? supabase.from("students").select("id, full_name, email").in("id", studentIds)
        : { data: [], error: null },

      institutionIds.length > 0
        ? supabase.from("institutions").select("id, name").in("id", institutionIds)
        : { data: [], error: null },

      courseIds.length > 0
        ? supabase.from("courses").select("id, name").in("id", courseIds)
        : { data: [], error: null },

      authorizationIds.length > 0
        ? supabase
            .from("internship_authorizations")
            .select("id, notes")
            .in("id", authorizationIds)
        : { data: [], error: null },
    ]);

  const error =
    studentsResult.error?.message ??
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    authorizationsResult.error?.message ??
    null;

  if (error) {
    return {
      unit,
      interns: [] as UnitInternAuthorizationRow[],
      institutions: [] as UnitInternOption[],
      courses: [] as UnitInternOption[],
      error,
    };
  }

  const students = new Map(
    (studentsResult.data ?? []).map((item) => [item.id, item]),
  );

  const institutionsData = (institutionsResult.data ?? []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const coursesData = (coursesResult.data ?? []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const institutions = new Map(institutionsData.map((item) => [item.id, item]));
  const courses = new Map(coursesData.map((item) => [item.id, item]));
  const authorizations = new Map(
    (authorizationsResult.data ?? []).map((item) => [item.id, item]),
  );

  let interns = internships.map((item) => ({
    id: item.id,
    student_name:
      students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    student_email: students.get(item.student_id)?.email ?? null,
    institution_name:
      institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    municipal_unit_name: unit.name,
    supervisor_name: item.supervisor_name,
    authorized_start_date: item.start_date,
    authorized_end_date: item.end_date,
    authorized_schedule: item.schedule,
    status: item.status,
    notes: authorizations.get(item.authorization_id)?.notes ?? null,
    created_at: item.created_at,
  })) as UnitInternAuthorizationRow[];

  if (studentFilter) {
    interns = interns.filter((item) =>
      [item.student_name, item.student_email, item.course_name, item.institution_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(studentFilter),
    );
  }

  return {
    unit,
    interns,
    institutions: institutionsData.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    courses: coursesData.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    error: null,
  };
}
