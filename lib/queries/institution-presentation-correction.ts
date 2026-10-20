import { createClient } from "@/lib/supabase/server";

function dateValue(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

function timeValue(value: string | null) {
  return value?.slice(0, 5) ?? "";
}

export async function getInstitutionPresentationCorrection(id: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, institution_id")
    .eq("id", user.id)
    .single();

  if (
    !profile?.is_active ||
    profile.role !== "instituicao" ||
    !profile.institution_id
  ) return null;

  const { data: presentation } = await supabase
    .from("student_presentations")
    .select("id, student_id, institution_id, course_id, agreement_id, inquiry_id, municipal_unit_id, status, review_notes, intended_period, intended_schedule, required_workload, updated_at")
    .eq("id", id)
    .eq("institution_id", profile.institution_id)
    .eq("status", "pendente_correcao")
    .maybeSingle();

  if (!presentation) return null;

  const [studentResult, termResult, documentsResult, courseResult, unitResult, calendarResult] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, cpf, identity_document, identity_issuer, email, phone, birth_date, address, academic_registration")
        .eq("id", presentation.student_id)
        .eq("institution_id", profile.institution_id)
        .single(),
      supabase
        .from("commitment_terms")
        .select("id, status, term_number, term_signed_at, internship_type, academic_period, professor_advisor_name, professor_advisor_email, internship_location, activities_plan, policy_number, insurance_company, insurance_valid_from, insurance_valid_until, internship_start_date, internship_end_date, required_workload, weekly_days, daily_start_time, daily_end_time, break_minutes, supervisor_name, notes")
        .eq("presentation_id", id)
        .eq("institution_id", profile.institution_id)
        .not("status", "in", "(cancelado,substituido)")
        .single(),
      supabase
        .from("student_documents")
        .select("id, document_type, status, notes, file_path, created_at")
        .eq("presentation_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("courses")
        .select("name")
        .eq("id", presentation.course_id)
        .single(),
      supabase
        .from("municipal_units")
        .select("name")
        .eq("id", presentation.municipal_unit_id)
        .single(),
      supabase
        .from("unit_calendar_exceptions")
        .select("start_date, end_date")
        .or(
          `municipal_unit_id.is.null,municipal_unit_id.eq.${presentation.municipal_unit_id}`
        ),
    ]);

  const error =
    studentResult.error ??
    termResult.error ??
    documentsResult.error ??
    courseResult.error ??
    unitResult.error ??
    calendarResult.error;

  if (error) throw new Error(error.message);
  if (!studentResult.data || !termResult.data) return null;

  const student = studentResult.data;
  const term = termResult.data;
  const documents = await Promise.all(
    (documentsResult.data ?? []).map(async (document) => {
      const signed = document.file_path
        ? await supabase.storage
            .from("student-documents")
            .createSignedUrl(document.file_path, 3600)
        : null;

      return {
        id: document.id,
        document_type: document.document_type,
        status: document.status,
        notes: document.notes,
        url: signed?.data?.signedUrl ?? null,
      };
    })
  );

  const key = [
    presentation.agreement_id,
    presentation.inquiry_id,
    presentation.course_id,
    presentation.municipal_unit_id,
  ].join("|");

  const workload = Number(
    presentation.required_workload ?? term.required_workload ?? 0
  );

  return {
    id: presentation.id,
    updatedAt: presentation.updated_at,
    reviewNotes: presentation.review_notes,
    studentName: student.full_name,
    documents,
    options: [{
      key,
      course_name: courseResult.data?.name ?? "Curso não identificado",
      municipal_unit_name: unitResult.data?.name ?? "Unidade não identificada",
      remaining_slots: 0,
      approved_students: 1,
      already_presented: 1,
      intended_period: presentation.intended_period,
      possible_schedule: presentation.intended_schedule,
      required_workload: workload,
      calendar_exceptions: calendarResult.data ?? [],
    }],
    selectedDays: Array.isArray(term.weekly_days) ? term.weekly_days : [],
    initialValues: {
      authorization_key: key,
      full_name: student.full_name ?? "",
      cpf: student.cpf ?? "",
      identity_document: student.identity_document ?? "",
      identity_issuer: student.identity_issuer ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      birth_date: dateValue(student.birth_date),
      address: student.address ?? "",
      academic_registration: student.academic_registration ?? "",
      academic_period: term.academic_period ?? "",
      term_number: term.term_number ?? "",
      term_signed_at: dateValue(term.term_signed_at),
      internship_type: term.internship_type ?? "obrigatorio",
      professor_advisor_name: term.professor_advisor_name ?? "",
      professor_advisor_email: term.professor_advisor_email ?? "",
      internship_location: term.internship_location ?? "",
      activities_plan: term.activities_plan ?? "",
      internship_start_date: dateValue(term.internship_start_date),
      internship_end_date: dateValue(term.internship_end_date),
      required_workload: String(workload),
      supervisor_name: term.supervisor_name ?? "",
      daily_start_time: timeValue(term.daily_start_time),
      daily_end_time: timeValue(term.daily_end_time),
      break_minutes: String(term.break_minutes ?? 0),
      insurance_company: term.insurance_company ?? "",
      policy_number: term.policy_number ?? "",
      insurance_valid_from: dateValue(term.insurance_valid_from),
      insurance_valid_until: dateValue(term.insurance_valid_until),
      notes: term.notes ?? "",
    },
  };
}
