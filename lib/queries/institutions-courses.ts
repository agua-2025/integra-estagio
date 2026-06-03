import { createClient } from "@/lib/supabase/server";

export type Institution = {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  institution_id: string;
  name: string;
  level: string | null;
  workload_required: number | null;
  is_active: boolean;
  created_at: string;
};

export async function getInstitutionsAndCourses() {
  const supabase = await createClient();

  const [institutionsResult, coursesResult] = await Promise.all([
    supabase
      .from("institutions")
      .select("id, name, cnpj, city, state, phone, email, status, notes, created_at")
      .order("name", { ascending: true }),

    supabase
      .from("courses")
      .select("id, institution_id, name, level, workload_required, is_active, created_at")
      .order("name", { ascending: true }),
  ]);

  return {
    institutions: (institutionsResult.data ?? []) as Institution[],
    courses: (coursesResult.data ?? []) as Course[],
    error: institutionsResult.error?.message ?? coursesResult.error?.message ?? null,
  };
}
