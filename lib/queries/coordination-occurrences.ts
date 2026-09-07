import { createClient } from "@/lib/supabase/server";

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

export async function getCoordinationOccurrencesData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
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
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const { data: occurrencesData, error: occurrencesError } = await supabase
    .from("internship_occurrences")
    .select(
      "id, student_id, institution_id, course_id, municipal_unit_id, occurrence_type, occurrence_date, description, status, resolution_notes, created_at, resolved_at",
    )
    .order("created_at", { ascending: false });

  if (occurrencesError) {
    return {
      occurrences: [] as CoordinationOccurrenceRow[],
      error: occurrencesError.message,
    };
  }

  const occurrences = occurrencesData ?? [];

  const studentIds = Array.from(
    new Set(occurrences.map((item) => item.student_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(occurrences.map((item) => item.institution_id).filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set(occurrences.map((item) => item.course_id).filter(Boolean)),
  ) as string[];

  const unitIds = Array.from(
    new Set(occurrences.map((item) => item.municipal_unit_id).filter(Boolean)),
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
      occurrences: [] as CoordinationOccurrenceRow[],
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

  const units = new Map(
    (unitsResult.data ?? []).map((item) => [item.id, item]),
  );

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
    error: null,
  };
}
