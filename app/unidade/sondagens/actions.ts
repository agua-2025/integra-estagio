"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedResponseStatuses = [
  "campo_disponivel",
  "campo_com_limite",
  "sem_disponibilidade",
  "precisa_analise",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeNonNegativeInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
}

export async function respondUnitInquiry(formData: FormData) {
  const supabase = await createClient();

  const responseId = normalizeText(formData.get("response_id"));
  const responseStatus = normalizeText(formData.get("response_status"));
  const availableSlots = normalizeNonNegativeInteger(
    formData.get("available_slots"),
  );
  const possibleSchedule = normalizeText(formData.get("possible_schedule"));
  const compatibleActivities = normalizeText(
    formData.get("compatible_activities"),
  );
  const supervisorName = normalizeText(formData.get("supervisor_name"));
  const notes = normalizeText(formData.get("notes"));

  if (!responseId) {
    throw new Error("Sondagem não identificada.");
  }

  if (!responseStatus || !allowedResponseStatuses.includes(responseStatus)) {
    throw new Error("Selecione uma resposta válida.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, municipal_unit_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    throw new Error("Perfil não encontrado ou inativo.");
  }

  if (!profile.municipal_unit_id) {
    throw new Error("Usuário não vinculado a uma unidade municipal.");
  }

  const { data: response, error: responseError } = await supabase
    .from("inquiry_unit_responses")
    .select("id, municipal_unit_id")
    .eq("id", responseId)
    .single();

  if (
    responseError ||
    !response ||
    response.municipal_unit_id !== profile.municipal_unit_id
  ) {
    throw new Error("Sondagem não encontrada para esta unidade.");
  }

  const { error } = await supabase
    .from("inquiry_unit_responses")
    .update({
      response_status: responseStatus,
      available_slots: availableSlots,
      possible_schedule: possibleSchedule,
      compatible_activities: compatibleActivities,
      supervisor_name: supervisorName,
      notes,
      responded_by: user.id,
    })
    .eq("id", responseId);

  if (error) {
    throw new Error(`Não foi possível salvar a resposta: ${error.message}`);
  }

  revalidatePath("/unidade/sondagens");
  redirect("/unidade/sondagens?sucesso=1");
}
