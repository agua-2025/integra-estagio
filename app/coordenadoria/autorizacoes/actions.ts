"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function fail(message: string): never {
  redirect(`/coordenadoria/autorizacoes?erro=${encodeURIComponent(message)}`);
}

export async function createInternshipAuthorization(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const supervisorName = normalizeText(formData.get("supervisor_name"));
  const authorizedStartDate = normalizeText(formData.get("authorized_start_date"));
  const authorizedEndDate = normalizeText(formData.get("authorized_end_date"));
  const authorizedSchedule = normalizeText(formData.get("authorized_schedule"));
  const notes = normalizeText(formData.get("notes"));

  if (!presentationId) {
    fail("Apresentação não identificada.");
  }

  if (!supervisorName) {
    fail("Informe o supervisor responsável.");
  }

  if (!authorizedStartDate) {
    fail("Informe a data de início autorizada.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail("Usuário não autenticado.");
  }

  const userId = user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    fail(profileError?.message ?? "Perfil não encontrado.");
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    fail("Acesso permitido apenas à Coordenadoria.");
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("student_presentations")
    .select(
      "id, student_id, institution_id, course_id, agreement_id, field_id, municipal_unit_id, status",
    )
    .eq("id", presentationId)
    .single();

  if (presentationError || !presentation) {
    fail(presentationError?.message ?? "Apresentação não encontrada.");
  }

  if (
    !["documentos_validados", "apto_para_autorizacao"].includes(
      presentation.status,
    )
  ) {
    fail("A apresentação ainda não está pronta para emissão da autorização.");
  }

  const { data: existingAuthorization, error: existingError } = await supabase
    .from("internship_authorizations")
    .select("id")
    .eq("presentation_id", presentationId)
    .maybeSingle();

  if (existingError) {
    fail(existingError.message);
  }

  if (existingAuthorization) {
    fail("Já existe autorização registrada para esta apresentação.");
  }

  const { error: insertError } = await supabase
    .from("internship_authorizations")
    .insert({
      presentation_id: presentation.id,
      student_id: presentation.student_id,
      institution_id: presentation.institution_id,
      course_id: presentation.course_id,
      agreement_id: presentation.agreement_id,
      field_id: presentation.field_id,
      municipal_unit_id: presentation.municipal_unit_id,
      supervisor_name: supervisorName,
      authorized_start_date: authorizedStartDate,
      authorized_end_date: authorizedEndDate,
      authorized_schedule: authorizedSchedule,
      status: "autorizado",
      authorized_by: userId,
      notes,
    });

  if (insertError) {
    fail(insertError.message);
  }

  const { error: updatePresentationError } = await supabase
    .from("student_presentations")
    .update({
      status: "autorizado",
      reviewed_by: userId,
    })
    .eq("id", presentation.id);

  if (updatePresentationError) {
    fail(updatePresentationError.message);
  }

  revalidatePath("/coordenadoria/autorizacoes");
  revalidatePath("/coordenadoria/estudantes");

  redirect("/coordenadoria/autorizacoes?sucesso=1");
}
