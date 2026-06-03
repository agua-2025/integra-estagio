"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createAccessRequest(formData: FormData) {
  const supabase = await createClient();

  const requesterName = normalizeText(formData.get("requester_name"));
  const requesterEmail = normalizeText(formData.get("requester_email"));
  const requesterPhone = normalizeText(formData.get("requester_phone"));
  const institutionName = normalizeText(formData.get("institution_name"));
  const institutionCnpj = normalizeText(formData.get("institution_cnpj"));
  const city = normalizeText(formData.get("city"));
  const state = normalizeText(formData.get("state"));
  const notes = normalizeText(formData.get("notes"));

  if (!requesterName || !requesterEmail || !institutionName) {
    redirect("/solicitar-acesso?erro=campos-obrigatorios");
  }

  const { error } = await supabase.from("access_requests").insert({
    requester_name: requesterName,
    requester_email: requesterEmail,
    requester_phone: requesterPhone,
    institution_name: institutionName,
    institution_cnpj: institutionCnpj,
    city,
    state,
    notes,
    status: "pendente",
  });

  if (error) {
    redirect("/solicitar-acesso?erro=falha-envio");
  }

  redirect("/solicitar-acesso?sucesso=1");
}
