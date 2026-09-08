import { createClient } from "@/lib/supabase/server";

export type InstitutionAgreementFilters = {
  status?: string;
  courseId?: string;
};

export type InstitutionAgreementCourseOption = {
  id: string;
  name: string;
};

export type InstitutionAgreementRow = {
  id: string;
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

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getInstitutionAgreementsData(
  filters: InstitutionAgreementFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      institution: null,
      agreements: [] as InstitutionAgreementRow[],
      courses: [] as InstitutionAgreementCourseOption[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, institution_id, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    profile.role !== "instituicao" ||
    !profile.institution_id
  ) {
    return {
      institution: null,
      agreements: [] as InstitutionAgreementRow[],
      courses: [] as InstitutionAgreementCourseOption[],
      error: "Acesso permitido apenas à instituição ativa.",
    };
  }

  const status = cleanFilter(filters.status);
  const courseId = cleanFilter(filters.courseId);

  let agreementsQuery = supabase
    .from("cooperation_agreements")
    .select(
      "id, institution_id, inquiry_id, status, legal_representative_name, institution_responsible_name, started_at, ended_at, signed_at, published_at, publication_reference, document_url, notes, created_at",
    )
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) {
    agreementsQuery = agreementsQuery.eq("status", status);
  }

  const [institutionResult, coursesResult, agreementsResult] = await Promise.all([
    supabase
      .from("institutions")
      .select("id, name, status")
      .eq("id", profile.institution_id)
      .single(),

    supabase
      .from("courses")
      .select("id, name")
      .eq("institution_id", profile.institution_id)
      .order("name", { ascending: true }),

    agreementsQuery,
  ]);

  const baseError =
    institutionResult.error?.message ??
    coursesResult.error?.message ??
    agreementsResult.error?.message ??
    null;

  if (baseError) {
    return {
      institution: institutionResult.data ?? null,
      agreements: [] as InstitutionAgreementRow[],
      courses: (coursesResult.data ?? []) as InstitutionAgreementCourseOption[],
      error: baseError,
    };
  }

  const agreements = agreementsResult.data ?? [];
  const agreementIds = agreements.map((agreement) => agreement.id);
  const inquiryIds = agreements.map((agreement) => agreement.inquiry_id).filter(Boolean);

  const [agreementCoursesResult, inquiriesResult] = await Promise.all([
    agreementIds.length > 0
      ? supabase
          .from("agreement_courses")
          .select("agreement_id, course_id, is_active")
          .in("agreement_id", agreementIds)
          .eq("is_active", true)
      : { data: [], error: null },

    inquiryIds.length > 0
      ? supabase
          .from("inquiries")
          .select("id, requested_area")
          .in("id", inquiryIds)
      : { data: [], error: null },
  ]);

  const relatedError =
    agreementCoursesResult.error?.message ??
    inquiriesResult.error?.message ??
    null;

  if (relatedError) {
    return {
      institution: institutionResult.data ?? null,
      agreements: [] as InstitutionAgreementRow[],
      courses: (coursesResult.data ?? []) as InstitutionAgreementCourseOption[],
      error: relatedError,
    };
  }

  const courses = (coursesResult.data ?? []) as InstitutionAgreementCourseOption[];
  const courseNames = new Map(courses.map((course) => [course.id, course.name]));

  const coursesByAgreement = new Map<string, string[]>();
  const courseIdsByAgreement = new Map<string, string[]>();

  for (const item of agreementCoursesResult.data ?? []) {
    const names = coursesByAgreement.get(item.agreement_id) ?? [];
    const ids = courseIdsByAgreement.get(item.agreement_id) ?? [];

    if (item.course_id) {
      ids.push(item.course_id);
      names.push(courseNames.get(item.course_id) ?? "Curso não identificado");
    }

    coursesByAgreement.set(item.agreement_id, names);
    courseIdsByAgreement.set(item.agreement_id, ids);
  }

  const inquiriesMap = new Map(
    (inquiriesResult.data ?? []).map((item) => [item.id, item]),
  );

  const today = new Date().toISOString().slice(0, 10);

  let rows = agreements.map((agreement) => {
    const agreementCourseIds = courseIdsByAgreement.get(agreement.id) ?? [];

    return {
      id: agreement.id,
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
      agreement_course_ids: agreementCourseIds,
    };
  });

  if (courseId) {
    rows = rows.filter((agreement) =>
      agreement.agreement_course_ids.includes(courseId),
    );
  }

  const publicRows = rows.map(({ agreement_course_ids, ...agreement }) => agreement);

  return {
    institution: institutionResult.data ?? null,
    agreements: publicRows as InstitutionAgreementRow[],
    courses,
    error: null,
  };
}
