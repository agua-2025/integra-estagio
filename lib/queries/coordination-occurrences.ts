import { createClient } from "@/lib/supabase/server";

export type CoordinationOccurrenceFilters = {
  status?: string;
  type?: string;
  institutionId?: string;
  courseId?: string;
  unitId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CoordinationOccurrenceFilterOption = {
  id: string;
  name: string;
};

export type CoordinationOccurrenceCourseOption = {
  id: string;
  name: string;
  institution_id: string | null;
};

export type CoordinationOccurrenceRow = {
  id: string;
  student_name: string;
  institution_name: string;
  course_name: string;
  municipal_unit_name: string;
  occurrence_type: string;
  occurrence_date: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

const allowedStatuses = [
  "pendente",
  "resolvida",
];

const allowedTypes = [
  "falta",
  "atraso",
  "ajuste_horario",
  "alteracao_supervisor",
  "dificuldade_acompanhamento",
  "encerramento_antecipado",
  "outra",
];

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getCoordinationOccurrencesData(
  filters: CoordinationOccurrenceFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: [] as CoordinationOccurrenceFilterOption[],
      courses: [] as CoordinationOccurrenceCourseOption[],
      units: [] as CoordinationOccurrenceFilterOption[],
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
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: [] as CoordinationOccurrenceFilterOption[],
      courses: [] as CoordinationOccurrenceCourseOption[],
      units: [] as CoordinationOccurrenceFilterOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: [] as CoordinationOccurrenceFilterOption[],
      courses: [] as CoordinationOccurrenceCourseOption[],
      units: [] as CoordinationOccurrenceFilterOption[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const status = cleanFilter(filters.status);
  const type = cleanFilter(filters.type);
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
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: [] as CoordinationOccurrenceFilterOption[],
      courses: [] as CoordinationOccurrenceCourseOption[],
      units: [] as CoordinationOccurrenceFilterOption[],
      error: optionsError,
    };
  }

  let occurrenceQuery = supabase
    .from("internship_occurrences")
    .select(
      "id, student_id, institution_id, course_id, municipal_unit_id, occurrence_type, occurrence_date, description, status, resolution_notes, created_at, resolved_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && allowedStatuses.includes(status)) {
    occurrenceQuery = occurrenceQuery.eq("status", status);
  }

  if (type && allowedTypes.includes(type)) {
    occurrenceQuery = occurrenceQuery.eq("occurrence_type", type);
  }

  if (institutionId) {
    occurrenceQuery = occurrenceQuery.eq("institution_id", institutionId);
  }

  if (courseId) {
    occurrenceQuery = occurrenceQuery.eq("course_id", courseId);
  }

  if (unitId) {
    occurrenceQuery = occurrenceQuery.eq("municipal_unit_id", unitId);
  }

  if (dateFrom) {
    occurrenceQuery = occurrenceQuery.gte("occurrence_date", dateFrom);
  }

  if (dateTo) {
    occurrenceQuery = occurrenceQuery.lte("occurrence_date", dateTo);
  }

  const { data: occurrencesData, error: occurrencesError } =
    await occurrenceQuery;

  if (occurrencesError) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationOccurrenceCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
      error: occurrencesError.message,
    };
  }

  const occurrences = occurrencesData ?? [];

  const studentIds = Array.from(
    new Set(occurrences.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const { data: studentsData, error: studentsError } =
    studentIds.length > 0
      ? await supabase.from("students").select("id, full_name").in("id", studentIds)
      : { data: [], error: null };

  if (studentsError) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      institutions: (institutionsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
      courses: (coursesResult.data ?? []) as CoordinationOccurrenceCourseOption[],
      units: (unitsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
      error: studentsError.message,
    };
  }

  const students = new Map((studentsData ?? []).map((item) => [item.id, item]));

  const institutions = new Map(
    (institutionsResult.data ?? []).map((item) => [item.id, item]),
  );

  const courses = new Map(
    (coursesResult.data ?? []).map((item) => [item.id, item]),
  );

  const units = new Map((unitsResult.data ?? []).map((item) => [item.id, item]));

  const occurrenceRows = occurrences.map((item) => ({
    id: item.id,
    student_name:
      students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    institution_name:
      institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    municipal_unit_name:
      units.get(item.municipal_unit_id)?.name ?? "Unidade não identificada",
    occurrence_type: item.occurrence_type,
    occurrence_date: item.occurrence_date,
    description: item.description,
    status: item.status,
    resolution_notes: item.resolution_notes,
    created_at: item.created_at,
    resolved_at: item.resolved_at,
  })) as CoordinationOccurrenceRow[];

  return {
    occurrences: occurrenceRows,
    institutions: (institutionsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
    courses: (coursesResult.data ?? []) as CoordinationOccurrenceCourseOption[],
    units: (unitsResult.data ?? []) as CoordinationOccurrenceFilterOption[],
    error: null,
  };
}
