import { createClient } from "@/lib/supabase/server";

export type AccessRequest = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  institution_name: string;
  institution_cnpj: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  status: string;
  review_notes: string | null;
  created_at: string;
};

export async function getAccessRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("access_requests")
    .select(
      "id, requester_name, requester_email, requester_phone, institution_name, institution_cnpj, city, state, notes, status, review_notes, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      requests: [] as AccessRequest[],
      error: error.message,
    };
  }

  return {
    requests: (data ?? []) as AccessRequest[],
    error: null,
  };
}
