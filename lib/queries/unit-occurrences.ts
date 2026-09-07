import { createClient } from "@/lib/supabase/server";

export type UnitOccurrenceInternOption = {
  id: string;
  student_name: string;
  course_name: string;
  institution_name: string;
  supervisor_name: string;
};

export type UnitOccurrenceRow = {
  id: string;
  student_name: string;
  course_name: string;
  institution_name: string;
  occurrence_type: string;
  occurrence_date: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
};

export async function getUnitOccurrencesData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      unit: null,
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
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
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    return {
      unit: null,
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
      error: "Acesso permitido apenas à unidade municipal ativa.",
    };
  }

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, responsible_name")
    .eq("id", profile.municipal_unit_id)
    .single();

  if (unitError || !unit) {
    return {
      unit: null,
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
      error: unitError?.message ?? "Unidade municipal não encontrada.",
    };
  }

  const { data: authorizationsData, error: authorizationsError } = await supabase
    .from("internship_authorizations")
    .select("id, student_id, institution_id, course_id, supervisor_name")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .eq("status", "autorizado")
    .order("created_at", { ascending: false });

  const { data: occurrencesData, error: occurrencesError } = await supabase
    .from("internship_occurrences")
    .select("id, authorization_id, student_id, institution_id, course_id, occurrence_type, occurrence_date, description, status, resolution_notes, created_at")
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("created_at", { ascending: false });

  const baseError = authorizationsError?.message ?? occurrencesError?.message ?? null;

  if (baseError) {
    return {
      unit,
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
      error: baseError,
    };
  }

  const authorizations = authorizationsData ?? [];
  const occurrences = occurrencesData ?? [];

  const studentIds = Array.from(
    new Set([
      ...authorizations.map((item) => item.student_id),
      ...occurrences.map((item) => item.student_id),
    ].filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set([
      ...authorizations.map((item) => item.institution_id),
      ...occurrences.map((item) => item.institution_id),
    ].filter(Boolean)),
  ) as string[];

  const courseIds = Array.from(
    new Set([
      ...authorizations.map((item) => item.course_id),
      ...occurrences.map((item) => item.course_id),
    ].filter(Boolean)),
  ) as string[];

  const [studentsResult, institutionsResult, coursesResult] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, full_name").in("id", studentIds)
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
      internOptions: [] as UnitOccurrenceInternOption[],
      occurrences: [] as UnitOccurrenceRow[],
      error,
    };
  }

  const students = new Map((studentsResult.data ?? []).map((item) => [item.id, item]));
  const institutions = new Map((institutionsResult.data ?? []).map((item) => [item.id, item]));
  const courses = new Map((coursesResult.data ?? []).map((item) => [item.id, item]));

  const internOptions = authorizations.map((item) => ({
    id: item.id,
    student_name: students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    institution_name: institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    supervisor_name: item.supervisor_name,
  })) as UnitOccurrenceInternOption[];

  const occurrenceRows = occurrences.map((item) => ({
    id: item.id,
    student_name: students.get(item.student_id)?.full_name ?? "Estudante não identificado",
    course_name: courses.get(item.course_id)?.name ?? "Curso não identificado",
    institution_name: institutions.get(item.institution_id)?.name ?? "Instituição não identificada",
    occurrence_type: item.occurrence_type,
    occurrence_date: item.occurrence_date,
    description: item.description,
    status: item.status,
    resolution_notes: item.resolution_notes,
    created_at: item.created_at,
  })) as UnitOccurrenceRow[];

  return {
    unit,
    internOptions,
    occurrences: occurrenceRows,
    error: null,
  };
}
