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

export async function getCoordinationInquiriesData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      inquiries: [] as CoordinationInquiry[],
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
      error: "Usuário sem permissão para visualizar sondagens.",
    };
  }

  const { data: inquiryRows, error: inquiriesError } = await supabase
    .from("inquiries")
    .select(
      "id, institution_id, course_id, requested_area, requested_students, required_workload, intended_period, notes, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (inquiriesError) {
    return {
      inquiries: [] as CoordinationInquiry[],
      error: inquiriesError.message,
    };
  }

  const inquiriesRaw = (inquiryRows ?? []) as InquiryRow[];

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
  })) as CoordinationInquiry[];

  return {
    inquiries,
    error: institutionsResult.error?.message ?? coursesResult.error?.message ?? null,
  };
}
