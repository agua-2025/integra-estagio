import { createClient } from "@/lib/supabase/server";

export type MunicipalUnit = {
  id: string;
  name: string;
  department: string | null;
  address: string | null;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getMunicipalUnits() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("municipal_units")
    .select(
      "id, name, department, address, responsible_name, email, phone, is_active, created_at",
    )
    .order("name", { ascending: true });

  if (error) {
    return {
      units: [] as MunicipalUnit[],
      error: error.message,
    };
  }

  return {
    units: (data ?? []) as MunicipalUnit[],
    error: null,
  };
}
