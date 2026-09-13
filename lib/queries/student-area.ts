import { createClient } from "@/lib/supabase/server";

type StudentProfile = {
  id: string;
  role: string;
  is_active: boolean;
  student_id: string | null;
};

type StudentRecord = {
  id: string;
  full_name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  academic_registration: string | null;
  institution_id: string;
  course_id: string;
};

type PresentationRecord = {
  id: string;
  student_id: string;
  institution_id: string;
  course_id: string;
  agreement_id: string;
  inquiry_id: string | null;
  municipal_unit_id: string | null;
  status: string;
  intended_period: string | null;
  intended_schedule: string | null;
  required_workload: number | null;
  review_notes: string | null;
  created_at: string;
};

type AuthorizationRecord = {
  id: string;
  presentation_id: string;
  student_id: string;
  institution_id: string;
  course_id: string;
  municipal_unit_id: string;
  supervisor_name: string;
  authorized_start_date: string;
  authorized_end_date: string | null;
  authorized_schedule: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type InternshipRecord = {
  id: string;
  authorization_id: string;
  student_id: string;
  institution_id: string;
  course_id: string;
  municipal_unit_id: string;
  supervisor_name: string;
  start_date: string;
  end_date: string | null;
  schedule: string | null;
  status: string;
  created_at: string;
};

type DocumentRecord = {
  id: string;
  document_type: string;
  file_path: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type OccurrenceRecord = {
  id: string;
  occurrence_type: string;
  occurrence_date: string;
  description: string;
  status: string;
  created_at: string;
};

type FinalReportRecord = {
  id: string;
  closing_status: string;
  performed_period: string | null;
  completed_workload: number | null;
  created_at: string;
};

export async function getStudentAreaData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      profile: null,
      student: null,
      presentation: null,
      authorization: null,
      internship: null,
      documents: [] as DocumentRecord[],
      occurrences: [] as OccurrenceRecord[],
      finalReport: null,
      institution: null,
      course: null,
      unit: null,
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, student_id")
    .eq("id", user.id)
    .single<StudentProfile>();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    profile.role !== "estagiario" ||
    !profile.student_id
  ) {
    return {
      profile: profile ?? null,
      student: null,
      presentation: null,
      authorization: null,
      internship: null,
      documents: [] as DocumentRecord[],
      occurrences: [] as OccurrenceRecord[],
      finalReport: null,
      institution: null,
      course: null,
      unit: null,
      error: "Acesso permitido apenas ao estagiário ativo.",
    };
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, cpf, email, phone, birth_date, academic_registration, institution_id, course_id")
    .eq("id", profile.student_id)
    .single<StudentRecord>();

  if (studentError || !student) {
    return {
      profile,
      student: null,
      presentation: null,
      authorization: null,
      internship: null,
      documents: [] as DocumentRecord[],
      occurrences: [] as OccurrenceRecord[],
      finalReport: null,
      institution: null,
      course: null,
      unit: null,
      error: studentError?.message ?? "Estagiário não encontrado.",
    };
  }

  const [
    presentationResult,
    authorizationResult,
    internshipResult,
    institutionResult,
    courseResult,
  ] = await Promise.all([
    supabase
      .from("student_presentations")
      .select("id, student_id, institution_id, course_id, agreement_id, inquiry_id, municipal_unit_id, status, intended_period, intended_schedule, required_workload, review_notes, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<PresentationRecord>(),

    supabase
      .from("internship_authorizations")
      .select("id, presentation_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, authorized_start_date, authorized_end_date, authorized_schedule, status, notes, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AuthorizationRecord>(),

    supabase
      .from("internships")
      .select("id, authorization_id, student_id, institution_id, course_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<InternshipRecord>(),

    supabase
      .from("institutions")
      .select("id, name")
      .eq("id", student.institution_id)
      .maybeSingle(),

    supabase
      .from("courses")
      .select("id, name")
      .eq("id", student.course_id)
      .maybeSingle(),
  ]);

  const presentation = presentationResult.data;
  const authorization = authorizationResult.data;
  const internship = internshipResult.data;

  const unitId =
    internship?.municipal_unit_id ??
    authorization?.municipal_unit_id ??
    presentation?.municipal_unit_id ??
    null;

  const [
    documentsResult,
    occurrencesResult,
    finalReportResult,
    unitResult,
  ] = await Promise.all([
    presentation
      ? supabase
          .from("student_documents")
          .select("id, document_type, file_path, status, notes, created_at")
          .eq("presentation_id", presentation.id)
          .order("created_at", { ascending: true })
      : { data: [], error: null },

    internship
      ? supabase
          .from("internship_occurrences")
          .select("id, occurrence_type, occurrence_date, description, status, created_at")
          .eq("internship_id", internship.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [], error: null },

    internship
      ? supabase
          .from("final_reports")
          .select("id, closing_status, performed_period, completed_workload, created_at")
          .eq("internship_id", internship.id)
          .maybeSingle<FinalReportRecord>()
      : { data: null, error: null },

    unitId
      ? supabase
          .from("municipal_units")
          .select("id, name, department, responsible_name")
          .eq("id", unitId)
          .maybeSingle()
      : { data: null, error: null },
  ]);

  const error =
    presentationResult.error?.message ??
    authorizationResult.error?.message ??
    internshipResult.error?.message ??
    institutionResult.error?.message ??
    courseResult.error?.message ??
    documentsResult.error?.message ??
    occurrencesResult.error?.message ??
    finalReportResult.error?.message ??
    unitResult.error?.message ??
    null;

  return {
    profile,
    student,
    presentation,
    authorization,
    internship,
    documents: (documentsResult.data ?? []) as DocumentRecord[],
    occurrences: (occurrencesResult.data ?? []) as OccurrenceRecord[],
    finalReport: finalReportResult.data ?? null,
    institution: institutionResult.data ?? null,
    course: courseResult.data ?? null,
    unit: unitResult.data ?? null,
    error,
  };
}
