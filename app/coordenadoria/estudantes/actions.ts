"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "apresentado",
  "em_analise",
  "pendente_correcao",
  "documentos_validados",
  "apto_para_autorizacao",
  "indeferido",
  "cancelado",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function fail(presentationId: string, message: string): never {
  redirect(
    `/coordenadoria/estudantes/${presentationId}/analise?erro=${encodeURIComponent(
      message,
    )}`,
  );
}

export async function updateStudentPresentationReview(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const status = normalizeText(formData.get("status"));
  const reviewNotes = normalizeText(formData.get("review_notes"));

  if (!presentationId) {
    redirect("/coordenadoria/estudantes?erro=Apresentação não identificada.");
  }

  if (!status || !allowedStatuses.includes(status)) {
    fail(presentationId, "Selecione uma situação válida.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail(presentationId, "Usuário não autenticado.");
  }

  const userId = user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    fail(presentationId, profileError?.message ?? "Perfil não encontrado.");
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    fail(presentationId, "Acesso permitido apenas à Coordenadoria.");
  }

  const { error } = await supabase
    .from("student_presentations")
    .update({
      status,
      reviewed_by: userId,
      review_notes: reviewNotes,
    })
    .eq("id", presentationId);

  if (error) {
    fail(presentationId, error.message);
  }

  revalidatePath("/coordenadoria/estudantes");
  revalidatePath(`/coordenadoria/estudantes/${presentationId}/analise`);

  redirect(`/coordenadoria/estudantes/${presentationId}/analise?sucesso=1`);
}
