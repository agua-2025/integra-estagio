"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function requireInstitutionUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, institution_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil não encontrado.");
  }

  if (profile.role !== "instituicao" || !profile.is_active || !profile.institution_id) {
    throw new Error("Acesso permitido apenas à instituição de ensino.");
  }

  return {
    supabase,
    profileId: profile.id as string,
    institutionId: profile.institution_id as string,
  };
}

async function getInstitutionAgreement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  institutionId: string,
) {
  const { data: agreement, error } = await supabase
    .from("cooperation_agreements")
    .select("id, institution_id, status, draft_text, institution_review_status")
    .eq("id", id)
    .eq("institution_id", institutionId)
    .single();

  if (error || !agreement) {
    throw new Error(error?.message ?? "Acordo não encontrado para esta instituição.");
  }

  if (!agreement.draft_text) {
    throw new Error("A minuta ainda não foi gerada pela Coordenadoria.");
  }

  if (agreement.status !== "minuta_gerada" && agreement.status !== "pendente_correcao") {
    throw new Error("Esta minuta não está disponível para conferência neste momento.");
  }

  return agreement;
}

export async function approveAgreementDraft(formData: FormData) {
  const { supabase, profileId, institutionId } = await requireInstitutionUser();

  const id = normalizeText(formData.get("id"));

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  await getInstitutionAgreement(supabase, id, institutionId);

  const { error } = await supabase
    .from("cooperation_agreements")
    .update({
      institution_review_status: "aprovada",
      institution_review_notes: null,
      institution_reviewed_at: new Date().toISOString(),
      institution_reviewed_by: profileId,
      status: "aguardando_assinatura",
    })
    .eq("id", id)
    .eq("institution_id", institutionId);

  if (error) {
    throw new Error(`Não foi possível confirmar a minuta: ${error.message}`);
  }

  revalidatePath("/instituicao/acordos");
  revalidatePath(`/instituicao/acordos/${id}`);
  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath(`/coordenadoria/acordos-cooperacao/${id}`);

  redirect("/instituicao/acordos?sucesso=minuta-aprovada");
}

export async function requestAgreementDraftCorrection(formData: FormData) {
  const { supabase, profileId, institutionId } = await requireInstitutionUser();

  const id = normalizeText(formData.get("id"));
  const notes = normalizeText(formData.get("notes"));

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  if (!notes) {
    throw new Error("Informe o motivo ou a correção necessária na minuta.");
  }

  await getInstitutionAgreement(supabase, id, institutionId);

  const { error } = await supabase
    .from("cooperation_agreements")
    .update({
      institution_review_status: "correcao_solicitada",
      institution_review_notes: notes,
      institution_reviewed_at: new Date().toISOString(),
      institution_reviewed_by: profileId,
      status: "pendente_correcao",
    })
    .eq("id", id)
    .eq("institution_id", institutionId);

  if (error) {
    throw new Error(`Não foi possível solicitar correção: ${error.message}`);
  }

  revalidatePath("/instituicao/acordos");
  revalidatePath(`/instituicao/acordos/${id}`);
  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath(`/coordenadoria/acordos-cooperacao/${id}`);

  redirect("/instituicao/acordos?sucesso=correcao-solicitada");
}
