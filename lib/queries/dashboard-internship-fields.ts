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

export type FieldUnitLink = {
  id: string;
  field_id: string;
  municipal_unit_id: string;
  available_slots: number | null;
  shift: string | null;
  supervisor_required: boolean;
  notes: string | null;
  is_active: boolean;
  municipal_units:
    | {
        id: string;
        name: string;
        department: string | null;
      }[]
    | null;
};

export type ActiveCourse = {
  id: string;
  name: string;
  institution_id: string;
  is_active: boolean;
  institutions:
    | {
        id: string;
        name: string;
      }[]
    | null;
};

export type FieldCourseLink = {
  id: string;
  field_id: string;
  course_id: string;
  is_active: boolean;
  courses:
    | {
        id: string;
        name: string;
        institution_id: string;
        institutions:
          | {
              id: string;
              name: string;
            }[]
          | null;
      }[]
    | null;
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

export async function getFieldUnitLinks(fieldId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("field_units")
    .select(
      "id, field_id, municipal_unit_id, available_slots, shift, supervisor_required, notes, is_active, municipal_units(id, name, department)",
    )
    .eq("field_id", fieldId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      links: [] as FieldUnitLink[],
      error: error.message,
    };
  }

  return {
    links: (data ?? []) as FieldUnitLink[],
    error: null,
  };
}

export async function getActiveCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, name, institution_id, is_active, institutions(id, name)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return {
      courses: [] as ActiveCourse[],
      error: error.message,
    };
  }

  return {
    courses: (data ?? []) as ActiveCourse[],
    error: null,
  };
}

export async function getFieldCourseLinks(fieldId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("field_courses")
    .select(
      "id, field_id, course_id, is_active, courses(id, name, institution_id, institutions(id, name))",
    )
    .eq("field_id", fieldId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      links: [] as FieldCourseLink[],
      error: error.message,
    };
  }

  return {
    links: (data ?? []) as FieldCourseLink[],
    error: null,
  };
}