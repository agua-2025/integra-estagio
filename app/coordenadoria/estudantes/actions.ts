"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "apresentado",
  "em_analise",
  "pendente_correcao",
  "documentos_validados",
  "apto_para_autorizacao",
  "indeferido",
  "cancelado",
];

const allowedDocumentStatuses = [
  "pendente",
  "enviado",
  "validado",
  "rejeitado",
  "substituido",
];

const allowedCommitmentTermStatuses = [
  "enviado",
  "em_analise",
  "pendente_correcao",
  "validado",
  "rejeitado",
  "substituido",
  "cancelado",
];

const requiredDocumentTypes = [
  "carta_apresentacao",
  "termo_compromisso",
  "seguro",
  "comprovante_matricula",
  "documento_identificacao",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeEmail(value: FormDataEntryValue | null) {
  const email = normalizeText(value)?.toLowerCase();
  return email ?? null;
}

function fail(presentationId: string, message: string): never {
  redirect(
    `/coordenadoria/estudantes/${presentationId}/analise?erro=${encodeURIComponent(
      message,
    )}`,
  );
}

async function ensureCoordinationPermission(presentationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail(presentationId, "Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    fail(presentationId, profileError?.message ?? "Perfil não encontrado.");
  }

  if (!profile.is_active || !["admin", "coordenadoria"].includes(profile.role)) {
    fail(presentationId, "Acesso permitido apenas à Coordenadoria.");
  }

  return user;
}

async function ensurePresentationReadyForAuthorization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  presentationId: string,
) {
  const { data: commitmentTerm, error: commitmentTermError } = await supabase
    .from("commitment_terms")
    .select(
      "id, status, term_document_id, insurance_document_id, policy_number, insurance_company, insurance_valid_from, insurance_valid_until, internship_start_date, internship_end_date, required_workload",
    )
    .eq("presentation_id", presentationId)
    .not("status", "in", "(cancelado,substituido)")
    .maybeSingle();

  if (commitmentTermError) {
    fail(presentationId, commitmentTermError.message);
  }

  if (!commitmentTerm) {
    fail(presentationId, "Registre e valide o Termo de Compromisso antes de avançar a apresentação.");
  }

  if (commitmentTerm.status !== "validado") {
    fail(presentationId, "O Termo de Compromisso precisa estar validado.");
  }

  if (
    !commitmentTerm.term_document_id ||
    !commitmentTerm.insurance_document_id ||
    !commitmentTerm.policy_number ||
    !commitmentTerm.insurance_company ||
    !commitmentTerm.insurance_valid_from ||
    !commitmentTerm.insurance_valid_until ||
    !commitmentTerm.internship_start_date ||
    !commitmentTerm.internship_end_date ||
    !commitmentTerm.required_workload
  ) {
    fail(presentationId, "O Termo de Compromisso possui dados obrigatórios incompletos.");
  }

  const { data: documents, error: documentsError } = await supabase
    .from("student_documents")
    .select("id, document_type, status")
    .eq("presentation_id", presentationId);

  if (documentsError) {
    fail(presentationId, documentsError.message);
  }

  for (const documentType of requiredDocumentTypes) {
    const document = (documents ?? []).find((item) => item.document_type === documentType);

    if (!document) {
      fail(presentationId, `Documento obrigatório não localizado: ${documentType}.`);
    }

    if (document.status !== "validado") {
      fail(presentationId, `Documento obrigatório ainda não validado: ${documentType}.`);
    }
  }

  const termDocument = (documents ?? []).find(
    (item) => item.id === commitmentTerm.term_document_id,
  );

  const insuranceDocument = (documents ?? []).find(
    (item) => item.id === commitmentTerm.insurance_document_id,
  );

  if (!termDocument || termDocument.status !== "validado") {
    fail(presentationId, "O documento vinculado ao Termo de Compromisso precisa estar validado.");
  }

  if (!insuranceDocument || insuranceDocument.status !== "validado") {
    fail(presentationId, "A apólice/seguro vinculada ao Termo de Compromisso precisa estar validada.");
  }
}

export async function updateStudentPresentationReview(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const status = normalizeText(formData.get("status"));
  const reviewNotes = normalizeText(formData.get("review_notes"));

  if (!presentationId) {
    redirect("/coordenadoria/estudantes?erro=Apresentação não identificada.");
  }

  if (!status || !allowedStatuses.includes(status)) {
    fail(presentationId, "Selecione uma situação válida.");
  }

  const user = await ensureCoordinationPermission(presentationId);

  if (["documentos_validados", "apto_para_autorizacao"].includes(status)) {
    await ensurePresentationReadyForAuthorization(supabase, presentationId);
  }

  const { error } = await supabase
    .from("student_presentations")
    .update({
      status,
      reviewed_by: user.id,
      review_notes: reviewNotes,
    })
    .eq("id", presentationId);

  if (error) {
    fail(presentationId, error.message);
  }

  revalidatePath("/coordenadoria/estudantes");
  revalidatePath("/coordenadoria/autorizacoes");
  revalidatePath(`/coordenadoria/estudantes/${presentationId}/analise`);

  redirect(`/coordenadoria/estudantes/${presentationId}/analise?sucesso=1`);
}

export async function updateStudentDocumentReview(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const documentId = normalizeText(formData.get("document_id"));
  const status = normalizeText(formData.get("status"));
  const notes = normalizeText(formData.get("notes"));

  if (!presentationId) {
    redirect("/coordenadoria/estudantes?erro=Apresentação não identificada.");
  }

  if (!documentId) {
    fail(presentationId, "Documento não identificado.");
  }

  if (!status || !allowedDocumentStatuses.includes(status)) {
    fail(presentationId, "Selecione uma situação válida para o documento.");
  }

  const user = await ensureCoordinationPermission(presentationId);

  const { data: document, error: documentError } = await supabase
    .from("student_documents")
    .select("id, presentation_id")
    .eq("id", documentId)
    .single();

  if (documentError || !document) {
    fail(presentationId, documentError?.message ?? "Documento não encontrado.");
  }

  if (document.presentation_id !== presentationId) {
    fail(presentationId, "O documento não pertence a esta apresentação.");
  }

  const { error } = await supabase
    .from("student_documents")
    .update({
      status,
      notes,
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) {
    fail(presentationId, error.message);
  }

  revalidatePath("/coordenadoria/estudantes");
  revalidatePath("/coordenadoria/autorizacoes");
  revalidatePath(`/coordenadoria/estudantes/${presentationId}/analise`);

  redirect(`/coordenadoria/estudantes/${presentationId}/analise?sucesso=1`);
}

export async function updateCommitmentTermReview(formData: FormData) {
  const supabase = await createClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const commitmentTermId = normalizeText(formData.get("commitment_term_id"));
  const status = normalizeText(formData.get("status"));
  const notes = normalizeText(formData.get("notes"));

  if (!presentationId) {
    redirect("/coordenadoria/estudantes?erro=Apresentação não identificada.");
  }

  if (!commitmentTermId) {
    fail(presentationId, "Termo de Compromisso não identificado.");
  }

  if (!status || !allowedCommitmentTermStatuses.includes(status)) {
    fail(presentationId, "Selecione uma situação válida para o Termo de Compromisso.");
  }

  const user = await ensureCoordinationPermission(presentationId);

  const { data: commitmentTerm, error: commitmentTermError } = await supabase
    .from("commitment_terms")
    .select("id, presentation_id")
    .eq("id", commitmentTermId)
    .single();

  if (commitmentTermError || !commitmentTerm) {
    fail(presentationId, commitmentTermError?.message ?? "Termo de Compromisso não encontrado.");
  }

  if (commitmentTerm.presentation_id !== presentationId) {
    fail(presentationId, "O Termo de Compromisso não pertence a esta apresentação.");
  }

  const { error } = await supabase
    .from("commitment_terms")
    .update({
      status,
      notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", commitmentTermId);

  if (error) {
    fail(presentationId, error.message);
  }

  revalidatePath("/coordenadoria/estudantes");
  revalidatePath("/coordenadoria/autorizacoes");
  revalidatePath(`/coordenadoria/estudantes/${presentationId}/analise`);

  redirect(`/coordenadoria/estudantes/${presentationId}/analise?sucesso=1`);
}

export async function releaseStudentAccess(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const presentationId = normalizeText(formData.get("presentation_id"));
  const fullName = normalizeText(formData.get("full_name"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeText(formData.get("password"));

  if (!presentationId) {
    redirect("/coordenadoria/estudantes?erro=Apresentação não identificada.");
  }

  await ensureCoordinationPermission(presentationId);

  if (!fullName) {
    fail(presentationId, "Informe o nome do estagiário.");
  }

  if (!email) {
    fail(presentationId, "Informe o e-mail de acesso do estagiário.");
  }

  if (!password || password.length < 8) {
    fail(presentationId, "Informe uma senha provisória com pelo menos 8 caracteres.");
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("student_presentations")
    .select("id, student_id, institution_id, course_id, status")
    .eq("id", presentationId)
    .single();

  if (presentationError || !presentation) {
    fail(presentationId, presentationError?.message ?? "Apresentação não encontrada.");
  }

  if (["cancelado", "indeferido"].includes(presentation.status)) {
    fail(presentationId, "Não é possível liberar acesso para apresentação cancelada ou indeferida.");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, email, institution_id, course_id")
    .eq("id", presentation.student_id)
    .single();

  if (studentError || !student) {
    fail(presentationId, studentError?.message ?? "Estagiário não encontrado.");
  }

  if (
    student.institution_id !== presentation.institution_id ||
    student.course_id !== presentation.course_id
  ) {
    fail(presentationId, "Os dados do estagiário não correspondem à apresentação.");
  }

  const { data: existingStudentProfile, error: existingStudentProfileError } =
    await supabase
      .from("profiles")
      .select("id, email")
      .eq("student_id", student.id)
      .maybeSingle();

  if (existingStudentProfileError) {
    fail(presentationId, existingStudentProfileError.message);
  }

  if (existingStudentProfile) {
    fail(
      presentationId,
      `Este estagiário já possui acesso vinculado ao e-mail ${existingStudentProfile.email}.`,
    );
  }

  const { data: existingEmailProfile, error: existingEmailProfileError } =
    await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

  if (existingEmailProfileError) {
    fail(presentationId, existingEmailProfileError.message);
  }

  if (existingEmailProfile) {
    fail(presentationId, "Já existe um profile cadastrado com este e-mail.");
  }

  const { data: createdUser, error: createUserError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        student_id: student.id,
        institution_id: presentation.institution_id,
        course_id: presentation.course_id,
        source: "student_access_release",
        presentation_id: presentation.id,
      },
    });

  if (createUserError || !createdUser.user) {
    fail(
      presentationId,
      `Não foi possível criar o usuário do estagiário: ${createUserError?.message}`,
    );
  }

  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: createdUser.user.id,
    full_name: fullName,
    email,
    role: "estagiario",
    institution_id: presentation.institution_id,
    municipal_unit_id: null,
    student_id: student.id,
    is_active: true,
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    fail(
      presentationId,
      `Usuário Auth criado, mas não foi possível criar o profile. O usuário foi removido. Detalhe: ${profileError.message}`,
    );
  }

  revalidatePath("/coordenadoria/estudantes");
  revalidatePath(`/coordenadoria/estudantes/${presentationId}/analise`);
  revalidatePath("/estagiario");

  redirect(`/coordenadoria/estudantes/${presentationId}/analise?acesso=1`);
}
