"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

function getSelectedUnitIds(formData: FormData) {
  return formData
    .getAll("unit_ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

const allowedStatus = [
  "ativo",
  "em_analise",
  "temporariamente_indisponivel",
  "inativo",
];

async function syncFieldUnits({
  fieldId,
  unitIds,
  availableSlots,
  shift,
  supervisorRequired,
}: {
  fieldId: string;
  unitIds: string[];
  availableSlots: number | null;
  shift: string | null;
  supervisorRequired: boolean;
}) {
  const supabase = await createClient();

  const { error: deactivateError } = await supabase
    .from("field_units")
    .update({
      is_active: false,
    })
    .eq("field_id", fieldId);

  if (deactivateError) {
    throw new Error(
      `Não foi possível atualizar as unidades vinculadas: ${deactivateError.message}`,
    );
  }

  if (unitIds.length === 0) {
    return;
  }

  const rows = unitIds.map((municipalUnitId) => ({
    field_id: fieldId,
    municipal_unit_id: municipalUnitId,
    available_slots: availableSlots,
    shift,
    supervisor_required: supervisorRequired,
    is_active: true,
  }));

  const { error: upsertError } = await supabase
    .from("field_units")
    .upsert(rows, {
      onConflict: "field_id,municipal_unit_id",
    });

  if (upsertError) {
    throw new Error(
      `Não foi possível vincular as unidades ao campo: ${upsertError.message}`,
    );
  }
}

export async function createInternshipField(formData: FormData) {
  const supabase = await createClient();

  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const area = normalizeText(formData.get("area"));
  const shift = normalizeText(formData.get("shift"));
  const availableSlots = normalizeInteger(formData.get("available_slots"));
  const isPublic = formData.get("is_public") === "on";
  const supervisorRequired = formData.get("supervisor_required") === "on";
  const status = String(formData.get("status") ?? "em_analise");
  const unitIds = getSelectedUnitIds(formData);

  if (!title) {
    throw new Error("Informe o nome do campo de estágio.");
  }

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para o campo de estágio.");
  }

  if (unitIds.length === 0 && (status === "ativo" || isPublic)) {
    redirect("/coordenadoria/campos-estagio");
  }

  const { data, error } = await supabase
    .from("internship_fields")
    .insert({
      title,
      description,
      area,
      shift,
      available_slots: availableSlots,
      status,
      is_public: isPublic,
      supervisor_required: supervisorRequired,
      display_order: 0,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Não foi possível cadastrar o campo: ${error.message}`);
  }

  await syncFieldUnits({
    fieldId: data.id,
    unitIds,
    availableSlots,
    shift,
    supervisorRequired,
  });

  revalidatePath("/coordenadoria/campos-estagio");
  revalidatePath("/campos-de-estagio");
}

export async function updateInternshipField(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("description"));
  const area = normalizeText(formData.get("area"));
  const shift = normalizeText(formData.get("shift"));
  const availableSlots = normalizeInteger(formData.get("available_slots"));
  const status = String(formData.get("status") ?? "em_analise");
  const isPublic = formData.get("is_public") === "on";
  const supervisorRequired = formData.get("supervisor_required") === "on";
  const unitIds = getSelectedUnitIds(formData);

  if (!id) {
    throw new Error("Campo não identificado.");
  }

  if (!title) {
    throw new Error("Informe o nome do campo de estágio.");
  }

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para o campo de estágio.");
  }

  if (unitIds.length === 0 && (status === "ativo" || isPublic)) {
    redirect(`/coordenadoria/campos-estagio/${id}`);
  }

  const { error } = await supabase
    .from("internship_fields")
    .update({
      title,
      description,
      area,
      shift,
      available_slots: availableSlots,
      status,
      is_public: isPublic,
      supervisor_required: supervisorRequired,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar o campo: ${error.message}`);
  }

  await syncFieldUnits({
    fieldId: id,
    unitIds,
    availableSlots,
    shift,
    supervisorRequired,
  });

  revalidatePath("/coordenadoria/campos-estagio");
  revalidatePath(`/coordenadoria/campos-estagio/${id}`);
  revalidatePath("/campos-de-estagio");

  redirect("/coordenadoria/campos-estagio");
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


