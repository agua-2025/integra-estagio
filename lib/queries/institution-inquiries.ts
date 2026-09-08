import { createClient } from "@/lib/supabase/server";

export type InstitutionInquiryFilters = {
  status?: string;
  courseId?: string;
  search?: string;
};

export type InstitutionInquiryProfile = {
  id: string;
  role: string;
  institution_id: string | null;
  is_active: boolean;
};

export type InstitutionInquiryInstitution = {
  id: string;
  name: string;
  status: string;
};

export type InstitutionInquiryCourse = {
  id: string;
  name: string;
  level: string | null;
  workload_required: number | null;
  is_active: boolean;
};

export type InstitutionInquiry = {
  id: string;
  course_id: string | null;
  requested_area: string | null;
  requested_students: number | null;
  required_workload: number | null;
  intended_period: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  coordination_decision: string | null;
  coordination_approved_students: number | null;
  coordination_notes: string | null;
  coordination_decided_at: string | null;
  course_name: string;
};

function cleanFilter(value?: string) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function getInstitutionInquiriesData(
  filters: InstitutionInquiryFilters = {},
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      profile: null,
      institution: null,
      courses: [] as InstitutionInquiryCourse[],
      inquiries: [] as InstitutionInquiry[],
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
      courses: [] as InstitutionInquiryCourse[],
      inquiries: [] as InstitutionInquiry[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.institution_id) {
    return {
      profile: profile as InstitutionInquiryProfile,
      institution: null,
      courses: [] as InstitutionInquiryCourse[],
      inquiries: [] as InstitutionInquiry[],
      error: "Complete o cadastro institucional antes de solicitar sondagens.",
    };
  }

  const status = cleanFilter(filters.status);
  const courseId = cleanFilter(filters.courseId);
  const search = cleanFilter(filters.search)?.toLowerCase();

  let inquiriesQuery = supabase
    .from("inquiries")
    .select(
      "id, course_id, requested_area, requested_students, required_workload, intended_period, notes, status, created_at, coordination_decision, coordination_approved_students, coordination_notes, coordination_decided_at",
    )
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (courseId) {
    inquiriesQuery = inquiriesQuery.eq("course_id", courseId);
  }

  const [institutionResult, coursesResult, inquiriesResult] = await Promise.all([
    supabase
      .from("institutions")
      .select("id, name, status")
      .eq("id", profile.institution_id)
      .single(),

    supabase
      .from("courses")
      .select("id, name, level, workload_required, is_active")
      .eq("institution_id", profile.institution_id)
      .order("name", { ascending: true }),

    inquiriesQuery,
  ]);

  const error =
    institutionResult.error?.message ??
    coursesResult.error?.message ??
    inquiriesResult.error?.message ??
    null;

  if (error) {
    return {
      profile: profile as InstitutionInquiryProfile,
      institution:
        (institutionResult.data as InstitutionInquiryInstitution | null) ?? null,
      courses: (coursesResult.data ?? []) as InstitutionInquiryCourse[],
      inquiries: [] as InstitutionInquiry[],
      error,
    };
  }

  const courses = (coursesResult.data ?? []) as InstitutionInquiryCourse[];
  const courseNames = new Map(courses.map((course) => [course.id, course.name]));

  let inquiries = (inquiriesResult.data ?? []).map((inquiry) => ({
    ...inquiry,
    course_name:
      inquiry.course_id && courseNames.has(inquiry.course_id)
        ? courseNames.get(inquiry.course_id)!
        : "Curso não identificado",
  })) as InstitutionInquiry[];

  if (status === "em_analise") {
    inquiries = inquiries.filter((item) =>
      [
        "recebida",
        "em_analise",
        "encaminhada",
        "encaminhada_unidade",
        "aguardando_unidade",
        "pendente",
      ].includes(item.status),
    );
  }

  if (status === "viavel") {
    inquiries = inquiries.filter((item) =>
      ["viavel", "viavel_parcial", "parcialmente_viavel"].includes(item.status),
    );
  }

  if (status === "sem_disponibilidade") {
    inquiries = inquiries.filter((item) =>
      ["sem_disponibilidade", "inviavel"].includes(item.status),
    );
  }

  if (status === "complementacao") {
    inquiries = inquiries.filter(
      (item) =>
        item.status === "complementacao_solicitada" ||
        item.coordination_decision === "precisa_complementacao",
    );
  }

  if (status === "concluida") {
    inquiries = inquiries.filter((item) => Boolean(item.coordination_decision));
  }

  if (search) {
    inquiries = inquiries.filter((item) => {
      const text = [
        item.course_name,
        item.requested_area,
        item.intended_period,
        item.notes,
        item.coordination_notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });
  }

  return {
    profile: profile as InstitutionInquiryProfile,
    institution:
      (institutionResult.data as InstitutionInquiryInstitution | null) ?? null,
    courses,
    inquiries,
    error: null,
  };
}
