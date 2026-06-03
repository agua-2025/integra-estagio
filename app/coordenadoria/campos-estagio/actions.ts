"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeInteger(value: FormDataEntryValue | null) {
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

export async function createInternshipField(formData: FormData) {
  const supabase = await createClient();

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const area = normalizeText(formData.get("area"));
  const shift = normalizeText(formData.get("shift"));
  const availableSlots = normalizeInteger(formData.get("available_slots"));
  const isPublic = formData.get("is_public") === "on";
  const status = String(formData.get("status") ?? "em_analise");

  if (!title) {
    throw new Error("Informe o nome do campo de estágio.");
  }

  const allowedStatus = [
    "ativo",
    "em_analise",
    "temporariamente_indisponivel",
    "inativo",
  ];

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para o campo de estágio.");
  }

  const { error } = await supabase.from("internship_fields").insert({
    title,
    description,
    area,
    shift,
    available_slots: availableSlots,
    status,
    is_public: isPublic,
    supervisor_required: true,
    display_order: 0,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar o campo: ${error.message}`);
  }

  revalidatePath("/coordenadoria/campos-estagio");
  revalidatePath("/campos-de-estagio");
}

export async function toggleFieldPublic(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const currentValue = formData.get("is_public") === "true";

  if (!id) {
    throw new Error("Campo não identificado.");
  }

  const { error } = await supabase
    .from("internship_fields")
    .update({
      is_public: !currentValue,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a publicação: ${error.message}`);
  }

  revalidatePath("/coordenadoria/campos-estagio");
  revalidatePath("/campos-de-estagio");
}

export async function updateFieldStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  const allowedStatus = [
    "ativo",
    "em_analise",
    "temporariamente_indisponivel",
    "inativo",
  ];

  if (!id) {
    throw new Error("Campo não identificado.");
  }

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para o campo de estágio.");
  }

  const { error } = await supabase
    .from("internship_fields")
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar o status: ${error.message}`);
  }

  revalidatePath("/coordenadoria/campos-estagio");
  revalidatePath("/campos-de-estagio");
}
