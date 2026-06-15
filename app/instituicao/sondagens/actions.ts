"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizePositiveInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
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

export async function createInstitutionInquiry(formData: FormData) {
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
    throw new Error("Somente instituição pode solicitar sondagem.");
  }

  if (!profile.institution_id) {
    throw new Error("Complete o cadastro institucional antes de solicitar sondagem.");
  }

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select("id, status")
    .eq("id", profile.institution_id)
    .single();

  if (institutionError || !institution) {
    throw new Error("Instituição não encontrada.");
  }

  if (institution.status !== "ativa") {
    throw new Error(
      "A instituição precisa estar ativa para solicitar sondagem.",
    );
  }

  const courseId = normalizeText(formData.get("course_id"));
  const requestedArea = normalizeText(formData.get("requested_area"));
  const requestedStudents = normalizePositiveInteger(
    formData.get("requested_students"),
  );
  const requiredWorkload = normalizeNonNegativeInteger(
    formData.get("required_workload"),
  );
  const intendedPeriod = normalizeText(formData.get("intended_period"));
  const notes = normalizeText(formData.get("notes"));

  if (!courseId) {
    throw new Error("Selecione o curso.");
  }

  if (!requestedArea) {
    throw new Error("Informe a área pretendida.");
  }

  if (!requestedStudents) {
    throw new Error("Informe a quantidade de estudantes.");
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, institution_id, is_active")
    .eq("id", courseId)
    .single();

  if (
    courseError ||
    !course ||
    course.institution_id !== profile.institution_id ||
    !course.is_active
  ) {
    throw new Error("Curso inválido para esta instituição.");
  }

  const { error } = await supabase.from("inquiries").insert({
    institution_id: profile.institution_id,
    course_id: courseId,
    field_id: null,
    requested_area: requestedArea,
    requested_students: requestedStudents,
    required_workload: requiredWorkload,
    intended_period: intendedPeriod,
    notes,
    status: "recebida",
    submitted_by: user.id,
  });

  if (error) {
    throw new Error(`Não foi possível enviar a sondagem: ${error.message}`);
  }

  revalidatePath("/instituicao/sondagens");
  redirect("/instituicao/sondagens?sucesso=1");
}
