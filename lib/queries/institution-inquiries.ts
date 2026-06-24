import { createClient } from "@/lib/supabase/server";

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

export async function getInstitutionInquiriesData() {
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
      .eq("is_active", true)
      .order("name", { ascending: true }),

    supabase
      .from("inquiries")
      .select(
        "id, course_id, requested_area, requested_students, required_workload, intended_period, notes, status, created_at, coordination_decision, coordination_approved_students, coordination_notes, coordination_decided_at",
      )
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false }),
  ]);

  const courses = (coursesResult.data ?? []) as InstitutionInquiryCourse[];
  const courseNames = new Map(courses.map((course) => [course.id, course.name]));

  const inquiries = (inquiriesResult.data ?? []).map((inquiry) => ({
    ...inquiry,
    course_name:
      inquiry.course_id && courseNames.has(inquiry.course_id)
        ? courseNames.get(inquiry.course_id)!
        : "Curso não identificado",
  })) as InstitutionInquiry[];

  return {
    profile: profile as InstitutionInquiryProfile,
    institution:
      (institutionResult.data as InstitutionInquiryInstitution | null) ?? null,
    courses,
    inquiries,
    error:
      institutionResult.error?.message ??
      coursesResult.error?.message ??
      inquiriesResult.error?.message ??
      null,
  };
}
