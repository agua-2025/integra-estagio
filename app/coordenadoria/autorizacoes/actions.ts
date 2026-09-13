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

function internshipStatusFromStartDate(startDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return startDate <= today ? "em_andamento" : "aguardando_inicio";
}

function dateIsBefore(left: string, right: string) {
  return left.slice(0, 10) < right.slice(0, 10);
}

function dateIsAfter(left: string, right: string) {
  return left.slice(0, 10) > right.slice(0, 10);
}

export async function createInternshipAuthorization(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const notes = normalizeText(formData.get("notes"));

  if (!presentationId) {
    fail("Apresentação não identificada.");
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
      "id, student_id, institution_id, course_id, agreement_id, field_id, municipal_unit_id, status, required_workload",
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

  if (!presentation.municipal_unit_id) {
    fail("A apresentação não possui unidade municipal definida.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .select("id, status, signed_at, published_at, started_at, ended_at")
    .eq("id", presentation.agreement_id)
    .single();

  if (agreementError || !agreement) {
    fail(agreementError?.message ?? "Acordo de cooperação não encontrado.");
  }

  if (agreement.status !== "ativo") {
    fail("O acordo de cooperação vinculado não está ativo.");
  }

  if (!agreement.signed_at || !agreement.published_at) {
    fail("O acordo de cooperação precisa estar assinado e publicado.");
  }

  const { data: commitmentTerm, error: commitmentTermError } = await supabase
    .from("commitment_terms")
    .select(
      `
        id,
        status,
        term_document_id,
        insurance_document_id,
        policy_number,
        insurance_company,
        insurance_valid_from,
        insurance_valid_until,
        internship_start_date,
        internship_end_date,
        internship_schedule,
        required_workload,
        supervisor_name
      `,
    )
    .eq("presentation_id", presentation.id)
    .neq("status", "cancelado")
    .neq("status", "substituido")
    .maybeSingle();

  if (commitmentTermError) {
    fail(commitmentTermError.message);
  }

  if (!commitmentTerm) {
    fail("Registre e valide o Termo de Compromisso antes de emitir a autorização.");
  }

  if (commitmentTerm.status !== "validado") {
    fail("O Termo de Compromisso precisa estar validado pela Coordenadoria.");
  }

  if (!commitmentTerm.term_document_id) {
    fail("O Termo de Compromisso precisa estar vinculado ao documento correspondente.");
  }

  if (!commitmentTerm.insurance_document_id) {
    fail("A apólice/seguro precisa estar vinculada ao Termo de Compromisso.");
  }

  if (
    !commitmentTerm.policy_number ||
    !commitmentTerm.insurance_company ||
    !commitmentTerm.insurance_valid_from ||
    !commitmentTerm.insurance_valid_until
  ) {
    fail("Informe no Termo de Compromisso os dados completos do seguro: seguradora, apólice e vigência.");
  }

  if (!commitmentTerm.internship_start_date || !commitmentTerm.internship_end_date) {
    fail("Informe no Termo de Compromisso o período do estágio.");
  }

  if (!commitmentTerm.supervisor_name) {
    fail("Informe no Termo de Compromisso o supervisor responsável.");
  }

  const supervisorName = commitmentTerm.supervisor_name;
  const authorizedStartDate = commitmentTerm.internship_start_date;
  const authorizedEndDate = commitmentTerm.internship_end_date;
  const authorizedSchedule = commitmentTerm.internship_schedule;

  if (dateIsAfter(authorizedStartDate, authorizedEndDate)) {
    fail("A data de início do Termo de Compromisso não pode ser posterior à data de término.");
  }

  if (agreement.started_at && dateIsBefore(authorizedStartDate, agreement.started_at)) {
    fail("A data de início do Termo de Compromisso não pode ser anterior ao início da vigência do acordo.");
  }

  if (agreement.ended_at && dateIsAfter(authorizedEndDate, agreement.ended_at)) {
    fail("A data de término do Termo de Compromisso não pode ultrapassar a vigência do acordo.");
  }

  const presentationWorkload = Number(presentation.required_workload ?? 0);
  const termWorkload = Number(commitmentTerm.required_workload ?? 0);

  if (presentationWorkload <= 0 || termWorkload <= 0) {
    fail("A carga horária obrigatória precisa constar na apresentação e no Termo de Compromisso.");
  }

  if (presentationWorkload !== termWorkload) {
    fail("A carga horária do Termo de Compromisso deve corresponder à carga horária da apresentação.");
  }

  if (dateIsAfter(commitmentTerm.insurance_valid_from, authorizedStartDate)) {
    fail("A vigência do seguro não cobre a data de início do estágio.");
  }

  if (dateIsBefore(commitmentTerm.insurance_valid_until, authorizedEndDate)) {
    fail("A vigência do seguro não cobre todo o período do estágio.");
  }

  const { data: requiredDocuments, error: documentsError } = await supabase
    .from("student_documents")
    .select("id, document_type, status")
    .eq("presentation_id", presentation.id)
    .in("document_type", [
      "termo_compromisso",
      "seguro",
      "comprovante_matricula",
      "documento_identificacao",
    ]);

  if (documentsError) {
    fail(documentsError.message);
  }

  const termDocument = requiredDocuments?.find(
    (document) => document.id === commitmentTerm.term_document_id,
  );

  const insuranceDocument = requiredDocuments?.find(
    (document) => document.id === commitmentTerm.insurance_document_id,
  );

  const enrollmentDocument = requiredDocuments?.find(
    (document) => document.document_type === "comprovante_matricula",
  );

  const identificationDocument = requiredDocuments?.find(
    (document) => document.document_type === "documento_identificacao",
  );

  if (!termDocument || termDocument.status !== "validado") {
    fail("O documento do Termo de Compromisso precisa estar validado.");
  }

  if (!insuranceDocument || insuranceDocument.status !== "validado") {
    fail("A apólice/seguro precisa estar validada.");
  }

  if (!enrollmentDocument || enrollmentDocument.status !== "validado") {
    fail("O comprovante de matrícula precisa estar validado.");
  }

  if (!identificationDocument || identificationDocument.status !== "validado") {
    fail("O documento de identificação precisa estar validado.");
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

  const { data: authorization, error: insertError } = await supabase
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
    })
    .select("id")
    .single();

  if (insertError || !authorization) {
    fail(insertError?.message ?? "Não foi possível emitir a autorização.");
  }

  const { error: internshipError } = await supabase.from("internships").insert({
    authorization_id: authorization.id,
    student_id: presentation.student_id,
    institution_id: presentation.institution_id,
    course_id: presentation.course_id,
    municipal_unit_id: presentation.municipal_unit_id,
    supervisor_name: supervisorName,
    start_date: authorizedStartDate,
    end_date: authorizedEndDate,
    schedule: authorizedSchedule,
    status: internshipStatusFromStartDate(authorizedStartDate),
  });

  if (internshipError) {
    fail(internshipError.message);
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
  revalidatePath(`/coordenadoria/estudantes/${presentation.id}/analise`);

  revalidatePath("/instituicao/estudantes");
  revalidatePath("/unidade/estagiarios");

  revalidatePath("/estagiario");
  revalidatePath("/estagiario/estagio");
  revalidatePath("/estagiario/documentos");
  revalidatePath("/estagiario/orientacoes");

  redirect("/coordenadoria/autorizacoes?sucesso=1");
}
