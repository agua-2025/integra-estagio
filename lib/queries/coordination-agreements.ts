import { createClient } from "@/lib/supabase/server";

export type CoordinationAgreementFilters = {
  status?: string;
  institutionId?: string;
};

export type CoordinationAgreementOption = {
  id: string;
  label: string;
};

export type CoordinationAgreementRow = {
  id: string;
  institution_id: string;
  institution_name: string;
  inquiry_id: string;
  status: string;
  legal_representative_name: string | null;
  institution_responsible_name: string | null;
  started_at: string | null;
  ended_at: string | null;
  signed_at: string | null;
  published_at: string | null;
  publication_reference: string | null;
  document_url: string | null;
  notes: string | null;
  created_at: string;
  requested_area: string | null;
  course_names: string[];
  is_ready_for_presentations: boolean;
};

export type CoordinationViableInquiryOption = {
  id: string;
  institution_id: string;
  institution_name: string;
  course_id: string | null;
  course_name: string;
  requested_area: string | null;
  requested_students: number | null;
  approved_students: number | null;
  created_at: string;
};

export type CoordinationViableInstitutionOption = {
  id: string;
  name: string;
};

export type CoordinationViableCourseOption = {
  institution_id: string;
  course_id: string;
  course_name: string;
};

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getCoordinationAgreementsData(
  filters: CoordinationAgreementFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      agreements: [] as CoordinationAgreementRow[],
      institutions: [] as CoordinationAgreementOption[],
      viableInquiries: [] as CoordinationViableInquiryOption[],
      viableInstitutions: [] as CoordinationViableInstitutionOption[],
      viableCourses: [] as CoordinationViableCourseOption[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    return {
      agreements: [] as CoordinationAgreementRow[],
      institutions: [] as CoordinationAgreementOption[],
      viableInquiries: [] as CoordinationViableInquiryOption[],
      viableInstitutions: [] as CoordinationViableInstitutionOption[],
      viableCourses: [] as CoordinationViableCourseOption[],
      error: "Acesso permitido apenas à Coordenadoria.",
    };
  }

  const status = cleanFilter(filters.status);
  const institutionId = cleanFilter(filters.institutionId);

  let agreementsQuery = supabase
    .from("cooperation_agreements")
    .select(
      "id, institution_id, inquiry_id, status, legal_representative_name, institution_responsible_name, started_at, ended_at, signed_at, published_at, publication_reference, document_url, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) {
    agreementsQuery = agreementsQuery.eq("status", status);
  }

  if (institutionId) {
    agreementsQuery = agreementsQuery.eq("institution_id", institutionId);
  }

  const [institutionsResult, coursesResult, agreementsResult, viableInquiriesResult] =
    await Promise.all([
      supabase
        .from("institutions")
        .select("id, name")
        .order("name", { ascending: true }),

      supabase
        .from("courses")
        .select("id, institution_id, name")
        .order("name", { ascending: true }),

      agreementsQuery,

      supabase
        .from("inquiries")
        .select(
          "id, institution_id, course_id, requested_area, requested_students, status, coordination_approved_students, created_at",
        )
        .in("status", ["viavel", "viavel_parcial"])
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const baseError =
    institutionsResult.error?.message ??
    coursesResult.error?.message ??
    agreementsResult.error?.message ??
    viableInquiriesResult.error?.message ??
    null;

  if (baseError) {
    return {
      agreements: [] as CoordinationAgreementRow[],
      institutions: [] as CoordinationAgreementOption[],
      viableInquiries: [] as CoordinationViableInquiryOption[],
      viableInstitutions: [] as CoordinationViableInstitutionOption[],
      viableCourses: [] as CoordinationViableCourseOption[],
      error: baseError,
    };
  }

  const institutions = (institutionsResult.data ?? []) as {
    id: string;
    name: string;
  }[];

  const courses = (coursesResult.data ?? []) as {
    id: string;
    institution_id: string;
    name: string;
  }[];

  const agreements = agreementsResult.data ?? [];
  const agreementIds = agreements.map((agreement) => agreement.id);
  const inquiryIds = agreements.map((agreement) => agreement.inquiry_id).filter(Boolean);

  const agreementCoursesResult =
    agreementIds.length > 0
      ? await supabase
          .from("agreement_courses")
          .select("agreement_id, course_id, is_active")
          .in("agreement_id", agreementIds)
          .eq("is_active", true)
      : { data: [], error: null };

  const inquiriesResult =
    inquiryIds.length > 0
      ? await supabase
          .from("inquiries")
          .select("id, requested_area")
          .in("id", inquiryIds)
      : { data: [], error: null };

  const relatedError =
    agreementCoursesResult.error?.message ??
    inquiriesResult.error?.message ??
    null;

  if (relatedError) {
    return {
      agreements: [] as CoordinationAgreementRow[],
      institutions: institutions.map((item) => ({
        id: item.id,
        label: item.name,
      })),
      viableInquiries: [] as CoordinationViableInquiryOption[],
      viableInstitutions: [] as CoordinationViableInstitutionOption[],
      viableCourses: [] as CoordinationViableCourseOption[],
      error: relatedError,
    };
  }

  const institutionNames = new Map(institutions.map((item) => [item.id, item.name]));
  const courseNames = new Map(courses.map((item) => [item.id, item.name]));

  const coursesByAgreement = new Map<string, string[]>();

  for (const item of agreementCoursesResult.data ?? []) {
    const names = coursesByAgreement.get(item.agreement_id) ?? [];

    if (item.course_id) {
      names.push(courseNames.get(item.course_id) ?? "Curso não identificado");
    }

    coursesByAgreement.set(item.agreement_id, names);
  }

  const inquiriesMap = new Map(
    (inquiriesResult.data ?? []).map((item) => [item.id, item]),
  );

  const today = new Date().toISOString().slice(0, 10);

  const rows = agreements.map((agreement) => ({
    id: agreement.id,
    institution_id: agreement.institution_id,
    institution_name:
      institutionNames.get(agreement.institution_id) ?? "Instituição não identificada",
    inquiry_id: agreement.inquiry_id,
    status: agreement.status,
    legal_representative_name: agreement.legal_representative_name,
    institution_responsible_name: agreement.institution_responsible_name,
    started_at: agreement.started_at,
    ended_at: agreement.ended_at,
    signed_at: agreement.signed_at,
    published_at: agreement.published_at,
    publication_reference: agreement.publication_reference,
    document_url: agreement.document_url,
    notes: agreement.notes,
    created_at: agreement.created_at,
    requested_area: inquiriesMap.get(agreement.inquiry_id)?.requested_area ?? null,
    course_names: coursesByAgreement.get(agreement.id) ?? [],
    is_ready_for_presentations:
      agreement.status === "ativo" &&
      Boolean(agreement.signed_at) &&
      Boolean(agreement.published_at) &&
      (!agreement.started_at || agreement.started_at <= today) &&
      (!agreement.ended_at || agreement.ended_at >= today),
  })) as CoordinationAgreementRow[];

  const viableInquiries = (viableInquiriesResult.data ?? []).map((inquiry) => ({
    id: inquiry.id,
    institution_id: inquiry.institution_id,
    institution_name:
      institutionNames.get(inquiry.institution_id) ?? "Instituição não identificada",
    course_id: inquiry.course_id,
    course_name:
      inquiry.course_id && courseNames.has(inquiry.course_id)
        ? courseNames.get(inquiry.course_id)!
        : "Curso não identificado",
    requested_area: inquiry.requested_area,
    requested_students: inquiry.requested_students,
    approved_students: inquiry.coordination_approved_students,
    created_at: inquiry.created_at,
  })) as CoordinationViableInquiryOption[];

  const viableCourseMap = new Map<string, CoordinationViableCourseOption>();

  for (const inquiry of viableInquiries) {
    if (!inquiry.course_id) {
      continue;
    }

    const key = `${inquiry.institution_id}:${inquiry.course_id}`;
    const current = viableCourseMap.get(key);

    if (current) {
      continue;
    }

    viableCourseMap.set(key, {
      institution_id: inquiry.institution_id,
      course_id: inquiry.course_id,
      course_name: inquiry.course_name,
    });
  }

  const viableInstitutionsMap = new Map<string, CoordinationViableInstitutionOption>();

  for (const course of viableCourseMap.values()) {
    viableInstitutionsMap.set(course.institution_id, {
      id: course.institution_id,
      name: institutionNames.get(course.institution_id) ?? "Instituição não identificada",
    });
  }

  return {
    agreements: rows,
    institutions: institutions.map((item) => ({
      id: item.id,
      label: item.name,
    })),
    viableInquiries,
    viableInstitutions: Array.from(viableInstitutionsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    viableCourses: Array.from(viableCourseMap.values()).sort((a, b) =>
      a.course_name.localeCompare(b.course_name),
    ),
    error: null,
  };
}
