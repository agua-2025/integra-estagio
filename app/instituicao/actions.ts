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

function getInstitutionPayload(formData: FormData) {
  return {
    name: normalizeText(formData.get("name")),
    cnpj: normalizeText(formData.get("cnpj")),
    city: normalizeText(formData.get("city")),
    state: normalizeText(formData.get("state")),
    phone: normalizeText(formData.get("phone")),
    email: normalizeText(formData.get("email")),
    notes: normalizeText(formData.get("notes")),

    legal_name: normalizeText(formData.get("legal_name")),
    trade_name: normalizeText(formData.get("trade_name")),
    address_line: normalizeText(formData.get("address_line")),
    address_number: normalizeText(formData.get("address_number")),
    address_complement: normalizeText(formData.get("address_complement")),
    neighborhood: normalizeText(formData.get("neighborhood")),
    zip_code: normalizeText(formData.get("zip_code")),
    legal_representative_name: normalizeText(
      formData.get("legal_representative_name"),
    ),
    legal_representative_role: normalizeText(
      formData.get("legal_representative_role"),
    ),
    internship_sector_contact_name: normalizeText(
      formData.get("internship_sector_contact_name"),
    ),
    internship_sector_contact_email: normalizeText(
      formData.get("internship_sector_contact_email"),
    ),
    internship_sector_contact_phone: normalizeText(
      formData.get("internship_sector_contact_phone"),
    ),
  };
}

const allowedCourseLevels = ["superior", "tecnico", "medio", "outro"];

export async function createOwnInstitution(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, institution_id, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    throw new Error("Perfil não encontrado ou inativo.");
  }

  if (profile.role !== "instituicao") {
    throw new Error("Somente perfil de instituição pode realizar este cadastro.");
  }

  if (profile.institution_id) {
    throw new Error("Este usuário já está vinculado a uma instituição.");
  }

  const payload = getInstitutionPayload(formData);

  if (!payload.name) {
    throw new Error("Informe o nome da instituição.");
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .insert({
      ...payload,
      status: "em_analise",
    })
    .select("id")
    .single();

  if (institutionError || !institution) {
    throw new Error(
      `Não foi possível cadastrar a instituição: ${institutionError?.message}`,
    );
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      institution_id: institution.id,
    })
    .eq("id", user.id);

  if (profileUpdateError) {
    throw new Error(
      `A instituição foi criada, mas não foi possível vincular o perfil: ${profileUpdateError.message}`,
    );
  }

  revalidatePath("/instituicao");
}

export async function updateOwnInstitution(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const payload = getInstitutionPayload(formData);

  if (!id) {
    throw new Error("Instituição não identificada.");
  }

  if (!payload.name) {
    throw new Error("Informe o nome da instituição.");
  }

  const { error } = await supabase
    .from("institutions")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar a instituição: ${error.message}`);
  }

  revalidatePath("/instituicao");
}

export async function createOwnCourse(formData: FormData) {
  const supabase = await createClient();

  const institutionId = normalizeText(formData.get("institution_id"));
  const name = normalizeText(formData.get("name"));
  const level = normalizeText(formData.get("level")) ?? "superior";
  const workloadRequired = normalizeInteger(formData.get("workload_required"));

  if (!institutionId) {
    throw new Error("Instituição não identificada.");
  }

  if (!name) {
    throw new Error("Informe o nome do curso.");
  }

  if (!allowedCourseLevels.includes(level)) {
    throw new Error("Nível inválido para o curso.");
  }

  const { error } = await supabase.from("courses").insert({
    institution_id: institutionId,
    name,
    level,
    workload_required: workloadRequired,
    is_active: true,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar o curso: ${error.message}`);
  }

  revalidatePath("/instituicao");
}
