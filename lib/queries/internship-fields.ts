import { supabase } from "@/lib/supabase";

export type PublicFieldUnit = {
  id: string;
  is_active: boolean;
  municipal_units:
    | {
        id: string;
        name: string;
        department: string | null;
      }[]
    | null;
};

export type PublicInternshipField = {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  available_slots: number | null;
  shift: string | null;
  display_order: number;
  field_units: PublicFieldUnit[] | null;
};

export async function getPublicInternshipFields() {
  const { data, error } = await supabase
    .from("internship_fields")
    .select(
      "id, title, description, area, available_slots, shift, display_order, field_units(id, is_active, municipal_units(id, name, department))",
    )
    .eq("status", "ativo")
    .eq("is_public", true)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Erro Supabase: ${error.message}`);
  }

  return (data ?? []) as PublicInternshipField[];
}
