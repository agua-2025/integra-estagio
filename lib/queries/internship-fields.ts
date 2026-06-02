import { supabase } from "@/lib/supabase";

export type PublicInternshipField = {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  available_slots: number | null;
  shift: string | null;
  display_order: number;
};

export async function getPublicInternshipFields() {
  const { data, error } = await supabase
    .from("internship_fields")
    .select(
      "id, title, description, area, available_slots, shift, display_order",
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
