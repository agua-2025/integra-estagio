import { createClient } from "@/lib/supabase/server";

export type UnitInquiryResponse = {
  id: string;
  inquiry_id: string;
  municipal_unit_id: string;
  response_status: string;
  available_slots: number | null;
  possible_schedule: string | null;
  compatible_activities: string | null;
  supervisor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  institution_name: string;
  course_name: string;
  requested_area: string | null;
  requested_students: number | null;
  required_workload: number | null;
  intended_period: string | null;
  inquiry_notes: string | null;
  inquiry_status: string;
};

type ResponseRow = {
  id: string;
  inquiry_id: string;
  municipal_unit_id: string;
  response_status: string;
  available_slots: number | null;
  possible_schedule: string | null;
  compatible_activities: string | null;
  supervisor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
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
};

type InstitutionRow = {
  id: string;
  name: string;
};

type CourseRow = {
  id: string;
  name: string;
};

export async function getUnitInquiriesData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      unitName: null,
      responses: [] as UnitInquiryResponse[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, municipal_unit_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return {
      unitName: null,
      responses: [] as UnitInquiryResponse[],
      error: profileError?.message ?? "Perfil não encontrado ou inativo.",
    };
  }

  if (!profile.municipal_unit_id) {
    return {
      unitName: null,
      responses: [] as UnitInquiryResponse[],
      error: "Usuário não vinculado a uma unidade municipal.",
    };
  }

  const [unitResult, responsesResult] = await Promise.all([
    supabase
      .from("municipal_units")
      .select("id, name")
      .eq("id", profile.municipal_unit_id)
      .single(),

    supabase
      .from("inquiry_unit_responses")
      .select(
        "id, inquiry_id, municipal_unit_id, response_status, available_slots, possible_schedule, compatible_activities, supervisor_name, notes, created_at, updated_at",
      )
      .eq("municipal_unit_id", profile.municipal_unit_id)
      .order("created_at", { ascending: false }),
  ]);

  if (responsesResult.error) {
    return {
      unitName: unitResult.data?.name ?? null,
      responses: [] as UnitInquiryResponse[],
      error: responsesResult.error.message,
    };
  }

  const responseRows = (responsesResult.data ?? []) as ResponseRow[];

  const inquiryIds = Array.from(
    new Set(responseRows.map((item) => item.inquiry_id)),
  );

  const inquiriesResult =
    inquiryIds.length > 0
      ? await supabase
          .from("inquiries")
          .select(
            "id, institution_id, course_id, requested_area, requested_students, required_workload, intended_period, notes, status",
          )
          .in("id", inquiryIds)
      : { data: [], error: null };

  if (inquiriesResult.error) {
    return {
      unitName: unitResult.data?.name ?? null,
      responses: [] as UnitInquiryResponse[],
      error: inquiriesResult.error.message,
    };
  }

  const inquiries = (inquiriesResult.data ?? []) as InquiryRow[];

  const institutionIds = Array.from(
    new Set(
      inquiries
        .map((item) => item.institution_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const courseIds = Array.from(
    new Set(
      inquiries
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

  const inquiryById = new Map(inquiries.map((item) => [item.id, item]));
  const institutionNames = new Map(
    ((institutionsResult.data ?? []) as InstitutionRow[]).map((item) => [
      item.id,
      item.name,
    ]),
  );
  const courseNames = new Map(
    ((coursesResult.data ?? []) as CourseRow[]).map((item) => [item.id, item.name]),
  );

  const responses = responseRows.map((response) => {
    const inquiry = inquiryById.get(response.inquiry_id);

    return {
      ...response,
      institution_name:
        inquiry?.institution_id && institutionNames.has(inquiry.institution_id)
          ? institutionNames.get(inquiry.institution_id)!
          : "Instituição não identificada",
      course_name:
        inquiry?.course_id && courseNames.has(inquiry.course_id)
          ? courseNames.get(inquiry.course_id)!
          : "Curso não identificado",
      requested_area: inquiry?.requested_area ?? null,
      requested_students: inquiry?.requested_students ?? null,
      required_workload: inquiry?.required_workload ?? null,
      intended_period: inquiry?.intended_period ?? null,
      inquiry_notes: inquiry?.notes ?? null,
      inquiry_status: inquiry?.status ?? "não informado",
    };
  }) as UnitInquiryResponse[];

  return {
    unitName: unitResult.data?.name ?? null,
    responses,
    error:
      unitResult.error?.message ??
      institutionsResult.error?.message ??
      coursesResult.error?.message ??
      null,
  };
}
