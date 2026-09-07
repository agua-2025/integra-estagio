import { createClient } from "@/lib/supabase/server";

export type PresentationOption = {
  key: string;
  inquiry_id: string;
  agreement_id: string;
  course_id: string;
  course_name: string;
  requested_area: string | null;
  requested_students: number | null;
  approved_students: number;
  already_presented: number;
  remaining_slots: number;
  required_workload: number | null;
  intended_period: string | null;
  municipal_unit_id: string;
  municipal_unit_name: string;
  possible_schedule: string | null;
  supervisor_name: string | null;
};

export async function getInstitutionStudentPresentationData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      profile: null,
      institution: null,
      options: [] as PresentationOption[],
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
      profile: null,
      institution: null,
      options: [] as PresentationOption[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.institution_id) {
    return {
      profile,
      institution: null,
      options: [] as PresentationOption[],
      error: "Complete o cadastro institucional antes de apresentar estudantes.",
    };
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select("id, name, status")
    .eq("id", profile.institution_id)
    .single();

  if (institutionError || !institution) {
    return {
      profile,
      institution: null,
      options: [] as PresentationOption[],
      error: institutionError?.message ?? "Instituição não encontrada.",
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: agreements, error: agreementsError } = await supabase
    .from("cooperation_agreements")
    .select("id, institution_id, inquiry_id, status, signed_at, published_at, started_at, ended_at")
    .eq("institution_id", profile.institution_id)
    .eq("status", "ativo")
    .not("signed_at", "is", null)
    .not("published_at", "is", null)
    .or(`started_at.is.null,started_at.lte.${today}`)
    .or(`ended_at.is.null,ended_at.gte.${today}`);

  if (agreementsError) {
    return {
      profile,
      institution,
      options: [] as PresentationOption[],
      error: agreementsError.message,
    };
  }

  const activeAgreements = agreements ?? [];

  if (activeAgreements.length === 0) {
    return {
      profile,
      institution,
      options: [] as PresentationOption[],
      error: null,
    };
  }

  const agreementIds = activeAgreements.map((agreement) => agreement.id);
  const inquiryIds = activeAgreements
    .map((agreement) => agreement.inquiry_id)
    .filter(Boolean) as string[];

  const [
    agreementCoursesResult,
    inquiriesResult,
    coursesResult,
    responsesResult,
    presentationsResult,
  ] = await Promise.all([
    supabase
      .from("agreement_courses")
      .select("agreement_id, course_id, is_active")
      .in("agreement_id", agreementIds),

    supabase
      .from("inquiries")
      .select("id, institution_id, course_id, requested_area, requested_students, required_workload, intended_period, status, coordination_decision, coordination_approved_students")
      .in("id", inquiryIds),

    supabase
      .from("courses")
      .select("id, name")
      .eq("institution_id", profile.institution_id),

    supabase
      .from("inquiry_unit_responses")
      .select("inquiry_id, municipal_unit_id, response_status, available_slots, possible_schedule, supervisor_name")
      .in("inquiry_id", inquiryIds),

    supabase
      .from("student_presentations")
      .select("id, inquiry_id, status")
      .eq("institution_id", profile.institution_id),
  ]);

  const error =
    agreementCoursesResult.error?.message ??
    inquiriesResult.error?.message ??
    coursesResult.error?.message ??
    responsesResult.error?.message ??
    presentationsResult.error?.message ??
    null;

  if (error) {
    return {
      profile,
      institution,
      options: [] as PresentationOption[],
      error,
    };
  }

  const agreementCourses = agreementCoursesResult.data ?? [];
  const inquiries = inquiriesResult.data ?? [];
  const courses = coursesResult.data ?? [];
  const responses = responsesResult.data ?? [];
  const presentations = presentationsResult.data ?? [];

  const unitIds = Array.from(
    new Set(
      responses
        .map((response) => response.municipal_unit_id)
        .filter(Boolean) as string[],
    ),
  );

  const { data: units, error: unitsError } =
    unitIds.length > 0
      ? await supabase.from("municipal_units").select("id, name").in("id", unitIds)
      : { data: [], error: null };

  if (unitsError) {
    return {
      profile,
      institution,
      options: [] as PresentationOption[],
      error: unitsError.message,
    };
  }

  const courseNames = new Map(courses.map((course) => [course.id, course.name]));
  const unitNames = new Map((units ?? []).map((unit) => [unit.id, unit.name]));

  const presentedCountByInquiry = new Map<string, number>();

  for (const presentation of presentations) {
    if (!presentation.inquiry_id) {
      continue;
    }

    if (["cancelado", "indeferido"].includes(presentation.status)) {
      continue;
    }

    presentedCountByInquiry.set(
      presentation.inquiry_id,
      (presentedCountByInquiry.get(presentation.inquiry_id) ?? 0) + 1,
    );
  }

  const options: PresentationOption[] = [];

  for (const agreement of activeAgreements) {
    if (!agreement.inquiry_id) {
      continue;
    }

    const inquiry = inquiries.find((item) => item.id === agreement.inquiry_id);

    if (!inquiry || !inquiry.course_id) {
      continue;
    }

    const isViable =
      inquiry.status === "viavel" ||
      inquiry.status === "viavel_parcial" ||
      inquiry.coordination_decision === "viavel" ||
      inquiry.coordination_decision === "parcialmente_viavel";

    const approvedStudents = Number(inquiry.coordination_approved_students ?? 0);

    if (!isViable || approvedStudents <= 0) {
      continue;
    }

    const courseLinked = agreementCourses.some(
      (item) =>
        item.agreement_id === agreement.id &&
        item.course_id === inquiry.course_id &&
        item.is_active !== false,
    );

    if (!courseLinked) {
      continue;
    }

    const alreadyPresented = presentedCountByInquiry.get(inquiry.id) ?? 0;
    const remainingSlots = approvedStudents - alreadyPresented;

    if (remainingSlots <= 0) {
      continue;
    }

    const availableResponses = responses.filter((response) => {
      if (response.inquiry_id !== inquiry.id || !response.municipal_unit_id) {
        return false;
      }

      const slots = Number(response.available_slots ?? 0);

      return (
        slots > 0 ||
        ["campo_disponivel", "campo_com_limite"].includes(
          response.response_status,
        )
      );
    });

    for (const response of availableResponses) {
      const municipalUnitId = response.municipal_unit_id as string;

      options.push({
        key: `${agreement.id}|${inquiry.id}|${inquiry.course_id}|${municipalUnitId}`,
        agreement_id: agreement.id,
        inquiry_id: inquiry.id,
        course_id: inquiry.course_id,
        course_name: courseNames.get(inquiry.course_id) ?? "Curso não identificado",
        requested_area: inquiry.requested_area,
        requested_students: inquiry.requested_students,
        approved_students: approvedStudents,
        already_presented: alreadyPresented,
        remaining_slots: remainingSlots,
        required_workload: inquiry.required_workload,
        intended_period: inquiry.intended_period,
        municipal_unit_id: municipalUnitId,
        municipal_unit_name: unitNames.get(municipalUnitId) ?? "Unidade não identificada",
        possible_schedule: response.possible_schedule,
        supervisor_name: response.supervisor_name,
      });
    }
  }

  return {
    profile,
    institution,
    options,
    error: null,
  };
}
