"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createMunicipalUnit(formData: FormData) {
  const supabase = await createClient();

  const name = normalizeText(formData.get("name"));
  const department = normalizeText(formData.get("department"));
  const responsibleName = normalizeText(formData.get("responsible_name"));
  const email = normalizeText(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const address = normalizeText(formData.get("address"));

  if (!name) {
    throw new Error("Informe o nome da unidade municipal.");
  }

  const { error } = await supabase.from("municipal_units").insert({
    name,
    department,
    responsible_name: responsibleName,
    email,
    phone,
    address,
    is_active: true,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar a unidade: ${error.message}`);
  }

  revalidatePath("/coordenadoria/unidades");
}

export async function toggleMunicipalUnitStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const currentValue = formData.get("is_active") === "true";

  if (!id) {
    throw new Error("Unidade não identificada.");
  }

  const { error } = await supabase
    .from("municipal_units")
    .update({
      is_active: !currentValue,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a unidade: ${error.message}`);
  }

  revalidatePath("/coordenadoria/unidades");
}
