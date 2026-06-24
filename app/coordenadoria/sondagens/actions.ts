"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return Math.floor(number);
}

async function ensureCoordinationPermission() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    throw new Error("Usuário sem permissão para executar esta ação.");
  }

  return { supabase, user };
}

export async function forwardInquiryToUnit(formData: FormData) {
  const { supabase } = await ensureCoordinationPermission();

  const inquiryId = normalizeText(formData.get("inquiry_id"));
  const municipalUnitId = normalizeText(formData.get("municipal_unit_id"));

  if (!inquiryId) {
    throw new Error("Sondagem não identificada.");
  }

  if (!municipalUnitId) {
    throw new Error("Selecione a unidade municipal.");
  }

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id")
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    throw new Error("Sondagem não encontrada.");
  }

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, is_active")
    .eq("id", municipalUnitId)
    .single();

  if (unitError || !unit || !unit.is_active) {
    throw new Error("Unidade municipal inválida ou inativa.");
  }

  const { data: existing } = await supabase
    .from("inquiry_unit_responses")
    .select("id")
    .eq("inquiry_id", inquiryId)
    .eq("municipal_unit_id", municipalUnitId)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase
      .from("inquiry_unit_responses")
      .insert({
        inquiry_id: inquiryId,
        municipal_unit_id: municipalUnitId,
        response_status: "precisa_analise",
      });

    if (insertError) {
      throw new Error(
        `Não foi possível encaminhar para a unidade: ${insertError.message}`,
      );
    }
  }

  const { error: updateError } = await supabase
    .from("inquiries")
    .update({
      status: "encaminhada_unidade",
    })
    .eq("id", inquiryId);

  if (updateError) {
    throw new Error(
      `Encaminhamento registrado, mas não foi possível atualizar o status: ${updateError.message}`,
    );
  }

  revalidatePath("/coordenadoria/sondagens");
  redirect(`/coordenadoria/sondagens/${inquiryId}/analise?encaminhada=1`);
}

export async function finalizeCoordinationInquiry(formData: FormData) {
  const { supabase, user } = await ensureCoordinationPermission();

  const inquiryId = normalizeText(formData.get("inquiry_id"));
  const decision = normalizeText(formData.get("coordination_decision"));
  const notes = normalizeText(formData.get("coordination_notes"));
  const approvedStudents = normalizeNumber(
    formData.get("coordination_approved_students"),
  );

  const allowedDecisions = [
    "viavel",
    "parcialmente_viavel",
    "inviavel",
    "precisa_complementacao",
  ];

  if (!inquiryId) {
    throw new Error("Sondagem não identificada.");
  }

  if (!decision || !allowedDecisions.includes(decision)) {
    throw new Error("Selecione uma conclusão válida para a sondagem.");
  }

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, requested_students")
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    throw new Error("Sondagem não encontrada.");
  }

  const requestedStudents =
    typeof inquiry.requested_students === "number"
      ? inquiry.requested_students
      : null;

  let finalApprovedStudents = approvedStudents;

  if (decision === "viavel" && finalApprovedStudents === null) {
    finalApprovedStudents = requestedStudents;
  }

  if (
    ["viavel", "parcialmente_viavel"].includes(decision) &&
    (finalApprovedStudents === null || finalApprovedStudents <= 0)
  ) {
    throw new Error(
      "Informe a quantidade viável/autorizada para a conclusão selecionada.",
    );
  }

  if (
    requestedStudents !== null &&
    finalApprovedStudents !== null &&
    finalApprovedStudents > requestedStudents
  ) {
    throw new Error(
      "A quantidade viável/autorizada não pode ser maior que a quantidade solicitada pela instituição.",
    );
  }

  if (
    decision === "parcialmente_viavel" &&
    requestedStudents !== null &&
    finalApprovedStudents === requestedStudents
  ) {
    throw new Error(
      "Para conclusão parcialmente viável, a quantidade autorizada deve ser menor que a quantidade solicitada.",
    );
  }

  if (decision === "inviavel") {
    finalApprovedStudents = 0;
  }

  if (decision === "precisa_complementacao") {
    finalApprovedStudents = null;
  }

  const nextStatus =
    decision === "precisa_complementacao" ? "em_analise" : decision;

  const { error } = await supabase
    .from("inquiries")
    .update({
      status: nextStatus,
      coordination_decision: decision,
      coordination_approved_students: finalApprovedStudents,
      coordination_notes: notes,
      coordination_decided_at: new Date().toISOString(),
      coordination_decided_by: user.id,
    })
    .eq("id", inquiryId);

  if (error) {
    throw new Error(
      `Não foi possível registrar a conclusão da Coordenadoria: ${error.message}`,
    );
  }

  revalidatePath("/coordenadoria/sondagens");
  redirect(`/coordenadoria/sondagens/${inquiryId}/analise?concluida=1`);
}
