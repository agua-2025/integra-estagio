"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = [
  "falta",
  "atraso",
  "ajuste_horario",
  "alteracao_supervisor",
  "dificuldade_acompanhamento",
  "encerramento_antecipado",
  "outra",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function fail(message: string): never {
  redirect(`/unidade/ocorrencias?erro=${encodeURIComponent(message)}`);
}

async function ensureUnitPermission() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, municipal_unit_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    fail(profileError?.message ?? "Perfil não encontrado.");
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    fail("Acesso permitido apenas à unidade municipal ativa.");
  }

  return {
    supabase,
    userId: user.id,
    municipalUnitId: profile.municipal_unit_id as string,
  };
}

export async function createUnitOccurrence(formData: FormData) {
  const { supabase, userId, municipalUnitId } = await ensureUnitPermission();

  const internshipId = normalizeText(formData.get("internship_id"));
  const occurrenceType = normalizeText(formData.get("occurrence_type"));
  const occurrenceDate = normalizeText(formData.get("occurrence_date"));
  const description = normalizeText(formData.get("description"));

  if (!internshipId) {
    fail("Selecione o estagiário.");
  }

  if (!occurrenceType || !allowedTypes.includes(occurrenceType)) {
    fail("Selecione um tipo de ocorrência válido.");
  }

  if (!occurrenceDate) {
    fail("Informe a data da ocorrência.");
  }

  if (!description) {
    fail("Descreva a ocorrência.");
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select("id, authorization_id, student_id, institution_id, course_id, municipal_unit_id")
    .eq("id", internshipId)
    .single();

  if (internshipError || !internship) {
    fail(internshipError?.message ?? "Estágio não encontrado.");
  }

  if (internship.municipal_unit_id !== municipalUnitId) {
    fail("Este estágio não pertence à sua unidade.");
  }

  const { error } = await supabase.from("internship_occurrences").insert({
    internship_id: internship.id,
    authorization_id: internship.authorization_id,
    student_id: internship.student_id,
    institution_id: internship.institution_id,
    course_id: internship.course_id,
    municipal_unit_id: internship.municipal_unit_id,
    occurrence_type: occurrenceType,
    occurrence_date: occurrenceDate,
    description,
    status: "pendente",
    reported_by: userId,
  });

  if (error) {
    fail(error.message);
  }

  revalidatePath("/unidade/ocorrencias");
  revalidatePath("/coordenadoria/ocorrencias");

  redirect("/unidade/ocorrencias?sucesso=1");
}

export async function resolveUnitOccurrence(formData: FormData) {
  const { supabase, userId, municipalUnitId } = await ensureUnitPermission();

  const occurrenceId = normalizeText(formData.get("occurrence_id"));
  const resolutionNotes = normalizeText(formData.get("resolution_notes"));

  if (!occurrenceId) {
    fail("Ocorrência não identificada.");
  }

  const { data: occurrence, error: occurrenceError } = await supabase
    .from("internship_occurrences")
    .select("id, municipal_unit_id")
    .eq("id", occurrenceId)
    .single();

  if (occurrenceError || !occurrence) {
    fail(occurrenceError?.message ?? "Ocorrência não encontrada.");
  }

  if (occurrence.municipal_unit_id !== municipalUnitId) {
    fail("Esta ocorrência não pertence à sua unidade.");
  }

  const { error } = await supabase
    .from("internship_occurrences")
    .update({
      status: "resolvida",
      resolution_notes: resolutionNotes,
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", occurrenceId);

  if (error) {
    fail(error.message);
  }

  revalidatePath("/unidade/ocorrencias");
  revalidatePath("/coordenadoria/ocorrencias");

  redirect("/unidade/ocorrencias?resolvida=1");
}
