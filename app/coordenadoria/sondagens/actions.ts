"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function forwardInquiryToUnit(formData: FormData) {
  const supabase = await createClient();

  const inquiryId = normalizeText(formData.get("inquiry_id"));
  const municipalUnitId = normalizeText(formData.get("municipal_unit_id"));

  if (!inquiryId) {
    throw new Error("Sondagem não identificada.");
  }

  if (!municipalUnitId) {
    throw new Error("Selecione a unidade municipal.");
  }

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
    throw new Error("Usuário sem permissão para encaminhar sondagem.");
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
  redirect("/coordenadoria/sondagens?encaminhada=1");
}


