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

const allowedInstitutionStatus = [
  "em_analise",
  "ativa",
  "pendente",
  "inativa",
  "bloqueada",
];

const allowedCourseLevels = ["superior", "tecnico", "medio", "outro"];

export async function createInstitution(formData: FormData) {
  const supabase = await createClient();

  const name = normalizeText(formData.get("name"));
  const cnpj = normalizeText(formData.get("cnpj"));
  const city = normalizeText(formData.get("city"));
  const state = normalizeText(formData.get("state"));
  const phone = normalizeText(formData.get("phone"));
  const email = normalizeText(formData.get("email"));
  const notes = normalizeText(formData.get("notes"));
  const status = String(formData.get("status") ?? "em_analise");

  if (!name) {
    throw new Error("Informe o nome da instituição.");
  }

  if (!allowedInstitutionStatus.includes(status)) {
    throw new Error("Status inválido para a instituição.");
  }

  const { error } = await supabase.from("institutions").insert({
    name,
    cnpj,
    city,
    state,
    phone,
    email,
    notes,
    status,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar a instituição: ${error.message}`);
  }

  revalidatePath("/coordenadoria/instituicoes-cursos");
}

export async function updateInstitutionStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!id) {
    throw new Error("Instituição não identificada.");
  }

  if (!allowedInstitutionStatus.includes(status)) {
    throw new Error("Status inválido para a instituição.");
  }

  const { error } = await supabase
    .from("institutions")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a instituição: ${error.message}`);
  }

  revalidatePath("/coordenadoria/instituicoes-cursos");
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();

  const institutionId = normalizeText(formData.get("institution_id"));
  const name = normalizeText(formData.get("name"));
  const level = normalizeText(formData.get("level")) ?? "superior";
  const workloadRequired = normalizeInteger(formData.get("workload_required"));

  if (!institutionId) {
    throw new Error("Selecione a instituição do curso.");
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

  revalidatePath("/coordenadoria/instituicoes-cursos");
}

export async function toggleCourseStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const currentValue = formData.get("is_active") === "true";

  if (!id) {
    throw new Error("Curso não identificado.");
  }

  const { error } = await supabase
    .from("courses")
    .update({ is_active: !currentValue })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar o curso: ${error.message}`);
  }

  revalidatePath("/coordenadoria/instituicoes-cursos");
}
