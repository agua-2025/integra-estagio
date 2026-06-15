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

  legal_name: string | null;
  trade_name: string | null;
  address_line: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  zip_code: string | null;
  legal_representative_name: string | null;
  legal_representative_role: string | null;
  internship_sector_contact_name: string | null;
  internship_sector_contact_email: string | null;
  internship_sector_contact_phone: string | null;
};

export type InstitutionAreaCourse = {
  id: string;
  institution_id: string;
  name: string;
  level: string | null;
  workload_required: number | null;
  is_active: boolean;
};

const institutionSelect = `
  id,
  name,
  cnpj,
  city,
  state,
  phone,
  email,
  status,
  notes,
  legal_name,
  trade_name,
  address_line,
  address_number,
  address_complement,
  neighborhood,
  zip_code,
  legal_representative_name,
  legal_representative_role,
  internship_sector_contact_name,
  internship_sector_contact_email,
  internship_sector_contact_phone
`;

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
      .select(institutionSelect)
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
