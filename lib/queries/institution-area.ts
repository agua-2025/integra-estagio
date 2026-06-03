import { createClient } from "@/lib/supabase/server";

export type InstitutionAreaProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  institution_id: string | null;
  is_active: boolean;
};

export type InstitutionAreaInstitution = {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  notes: string | null;
};

export type InstitutionAreaCourse = {
  id: string;
  institution_id: string;
  name: string;
  level: string | null;
  workload_required: number | null;
  is_active: boolean;
};

export async function getInstitutionAreaData() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      profile: null,
      institution: null,
      courses: [] as InstitutionAreaCourse[],
      error: "Usuário não autenticado.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, institution_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      profile: null,
      institution: null,
      courses: [] as InstitutionAreaCourse[],
      error: profileError?.message ?? "Perfil não encontrado.",
    };
  }

  if (!profile.institution_id) {
    return {
      profile: profile as InstitutionAreaProfile,
      institution: null,
      courses: [] as InstitutionAreaCourse[],
      error: null,
    };
  }

  const [institutionResult, coursesResult] = await Promise.all([
    supabase
      .from("institutions")
      .select("id, name, cnpj, city, state, phone, email, status, notes")
      .eq("id", profile.institution_id)
      .single(),

    supabase
      .from("courses")
      .select("id, institution_id, name, level, workload_required, is_active")
      .eq("institution_id", profile.institution_id)
      .order("name", { ascending: true }),
  ]);

  return {
    profile: profile as InstitutionAreaProfile,
    institution:
      (institutionResult.data as InstitutionAreaInstitution | null) ?? null,
    courses: (coursesResult.data ?? []) as InstitutionAreaCourse[],
    error:
      institutionResult.error?.message ?? coursesResult.error?.message ?? null,
  };
}
