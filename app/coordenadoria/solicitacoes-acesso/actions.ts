"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

const allowedStatus = ["pendente", "em_analise", "aprovada", "rejeitada", "cancelada"];

export async function updateAccessRequestStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const reviewNotes = normalizeText(formData.get("review_notes"));

  if (!id) {
    throw new Error("Solicitação não identificada.");
  }

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para a solicitação.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("access_requests")
    .update({
      status,
      review_notes: reviewNotes,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar a solicitação: ${error.message}`);
  }

  revalidatePath("/coordenadoria/solicitacoes-acesso");
}
