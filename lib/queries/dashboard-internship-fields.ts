import { createClient } from "@/lib/supabase/server";

export type DashboardInternshipField = {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  status: string;
  is_public: boolean;
  available_slots: number | null;
  shift: string | null;
  supervisor_required: boolean;
  display_order: number;
  municipal_unit_id: string | null;
  created_at: string;
};

export async function getDashboardInternshipFields() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("internship_fields")
    .select(
      "id, title, description, area, status, is_public, available_slots, shift, supervisor_required, display_order, municipal_unit_id, created_at",
    )
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    return {
      fields: [] as DashboardInternshipField[],
      error: error.message,
    };
  }

  return {
    fields: (data ?? []) as DashboardInternshipField[],
    error: null,
  };
}

export async function getDashboardInternshipFieldById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("internship_fields")
    .select(
      "id, title, description, area, status, is_public, available_slots, shift, supervisor_required, display_order, municipal_unit_id, created_at",
    )
    .eq("id", id)
    .single();

  if (error) {
    return {
      field: null,
      error: error.message,
    };
  }

  return {
    field: data as DashboardInternshipField,
    error: null,
  };
}
