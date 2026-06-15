import { createClient } from "@/lib/supabase/server";

export type CoordinationInquiry = {
  id: string;
  institution_id: string | null;
  course_id: string | null;
  requested_area: string | null;
  requested_students: number | null;
  required_workload: number | null;
  intended_period: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  institution_name: string;
  course_name: string;
  forwarded_units: string[];
};

export type CoordinationMunicipalUnit = {
  id: string;
  name: string;
  department: string | null;
  responsible_name: string | null;
  is_active: boolean;
};

type InquiryRow = {
  id: string;
  institution_id: string | null;
  course_id: string | null;
  requested_area: string | null;
  requested_students: number | null;
  required_workload: number | null;
  intended_period: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

type InstitutionRow = {
  id: string;
  name: string;
};

type CourseRow = {
  id: string;
  name: string;
};

type InquiryUnitResponseRow = {
  inquiry_id: string;
  municipal_unit_id: string;
};

export async function getCoordinationInquiriesData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      inquiries: [] as CoordinationInquiry[],
      units: [] as CoordinationMunicipalUnit[],
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
      inquiries: [] as CoordinationInquiry[],
      units: [] as CoordinationMunicipalUnit[],
      error: "Usuário sem permissão para visualizar sondagens.",
    };
  }

  const [inquiriesResult, unitsResult, responsesResult] = await Promise.all([
    supabase
      .from("inquiries")
      .select(
        "id, institution_id, course_id, requested_area, requested_students, required_workload, intended_period, notes, status, created_at",
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("municipal_units")
      .select("id, name, department, responsible_name, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),

    supabase
      .from("inquiry_unit_responses")
      .select("inquiry_id, municipal_unit_id"),
  ]);

  if (inquiriesResult.error) {
    return {
      inquiries: [] as CoordinationInquiry[],
      units: [] as CoordinationMunicipalUnit[],
      error: inquiriesResult.error.message,
    };
  }

  const inquiriesRaw = (inquiriesResult.data ?? []) as InquiryRow[];
  const units = (unitsResult.data ?? []) as CoordinationMunicipalUnit[];
  const responses = (responsesResult.data ?? []) as InquiryUnitResponseRow[];

  const institutionIds = Array.from(
    new Set(
      inquiriesRaw
        .map((item) => item.institution_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const courseIds = Array.from(
    new Set(
      inquiriesRaw
        .map((item) => item.course_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [institutionsResult, coursesResult] = await Promise.all([
    institutionIds.length > 0
      ? supabase.from("institutions").select("id, name").in("id", institutionIds)
      : Promise.resolve({ data: [], error: null }),

    courseIds.length > 0
      ? supabase.from("courses").select("id, name").in("id", courseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const institutions = (institutionsResult.data ?? []) as InstitutionRow[];
  const courses = (coursesResult.data ?? []) as CourseRow[];

  const institutionNames = new Map(
    institutions.map((institution) => [institution.id, institution.name]),
  );

  const courseNames = new Map(courses.map((course) => [course.id, course.name]));
  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]));

  const forwardedByInquiry = new Map<string, string[]>();

  for (const response of responses) {
    const current = forwardedByInquiry.get(response.inquiry_id) ?? [];
    const unitName = unitNames.get(response.municipal_unit_id);

    if (unitName) {
      current.push(unitName);
      forwardedByInquiry.set(response.inquiry_id, current);
    }
  }

  const inquiries = inquiriesRaw.map((inquiry) => ({
    ...inquiry,
    institution_name:
      inquiry.institution_id && institutionNames.has(inquiry.institution_id)
        ? institutionNames.get(inquiry.institution_id)!
        : "Instituição não identificada",
    course_name:
      inquiry.course_id && courseNames.has(inquiry.course_id)
        ? courseNames.get(inquiry.course_id)!
        : "Curso não identificado",
    forwarded_units: forwardedByInquiry.get(inquiry.id) ?? [],
  })) as CoordinationInquiry[];

  return {
    inquiries,
    units,
    error:
      institutionsResult.error?.message ??
      coursesResult.error?.message ??
      unitsResult.error?.message ??
      responsesResult.error?.message ??
      null,
  };
}
