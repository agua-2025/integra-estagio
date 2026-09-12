"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = [
  "rascunho",
  "em_analise",
  "pendente_correcao",
  "minuta_gerada",
  "aguardando_assinatura",
  "assinado",
  "publicado",
  "ativo",
  "vencido",
  "encerrado",
  "cancelado",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const text = normalizeText(value);
  return text || null;
}

function validateDateRange(startedAt: string | null, endedAt: string | null) {
  if (startedAt && endedAt && endedAt < startedAt) {
    throw new Error("A data final da vigência não pode ser anterior à data inicial.");
  }
}

function validateActiveAgreement(data: {
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  signedAt: string | null;
  publishedAt: string | null;
  documentUrl: string | null;
}) {
  if (data.status !== "ativo") {
    return;
  }

  if (!data.startedAt || !data.endedAt) {
    throw new Error("Para ativar o acordo, informe o início e o fim da vigência.");
  }

  if (!data.signedAt) {
    throw new Error("Para ativar o acordo, informe a data de assinatura.");
  }

  if (!data.publishedAt) {
    throw new Error("Para ativar o acordo, informe a data de publicação.");
  }

  if (!data.documentUrl) {
    throw new Error("Para ativar o acordo, informe o link do documento assinado/publicado.");
  }
}

async function requireCoordination() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    throw new Error("Acesso permitido apenas à Coordenadoria.");
  }

  return { supabase, profileId: profile.id as string };
}

export async function createCoordinationAgreement(formData: FormData) {
  const { supabase, profileId } = await requireCoordination();

  const institutionId = normalizeText(formData.get("institution_id"));
  const courseIds = Array.from(
    new Set(
      formData
        .getAll("course_ids")
        .map((value) => normalizeText(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const status = normalizeText(formData.get("status")) ?? "em_analise";
  const startedAt = normalizeDate(formData.get("started_at"));
  const endedAt = normalizeDate(formData.get("ended_at"));
  const legalRepresentativeName = normalizeText(
    formData.get("legal_representative_name"),
  );
  const institutionResponsibleName = normalizeText(
    formData.get("institution_responsible_name"),
  );
  const notes = normalizeText(formData.get("notes"));

  if (!institutionId) {
    throw new Error("Selecione a instituição vinculada ao acordo.");
  }

  if (courseIds.length === 0) {
    throw new Error("Selecione ao menos um curso abrangido pelo acordo.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Situação inválida para o acordo.");
  }

  if (!startedAt) {
    throw new Error("Informe o início da vigência do acordo.");
  }

  if (!endedAt) {
    throw new Error("Informe o fim da vigência do acordo.");
  }

  validateDateRange(startedAt, endedAt);

  if (!legalRepresentativeName) {
    throw new Error("Informe o representante legal da instituição.");
  }

  if (!institutionResponsibleName) {
    throw new Error("Informe o responsável institucional pelo estágio.");
  }

  const { data: viableCourseInquiries, error: viableCoursesError } = await supabase
    .from("inquiries")
    .select("id, institution_id, course_id, status, created_at")
    .eq("institution_id", institutionId)
    .in("course_id", courseIds)
    .in("status", ["viavel", "viavel_parcial", "convertida_em_acordo"])
    .order("created_at", { ascending: false });

  if (viableCoursesError) {
    throw new Error(viableCoursesError.message);
  }

  const validCourseIds = new Set(
    (viableCourseInquiries ?? [])
      .map((item) => item.course_id)
      .filter((value): value is string => Boolean(value)),
  );

  const invalidCourseIds = courseIds.filter((courseId) => !validCourseIds.has(courseId));

  if (invalidCourseIds.length > 0) {
    throw new Error(
      "Todos os cursos abrangidos precisam pertencer à instituição e possuir sondagem viável ou viável parcial.",
    );
  }

  const originInquiry = viableCourseInquiries?.[0];

  if (!originInquiry) {
    throw new Error("A instituição selecionada não possui sondagem viável para os cursos informados.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .insert({
      institution_id: institutionId,
      inquiry_id: originInquiry.id,
      status,
      legal_representative_name: legalRepresentativeName,
      institution_responsible_name: institutionResponsibleName,
      started_at: startedAt,
      ended_at: endedAt,
      notes,
      created_by: profileId,
      reviewed_by: profileId,
    })
    .select("id")
    .single();

  if (agreementError || !agreement) {
    throw new Error(agreementError?.message ?? "Não foi possível criar o acordo.");
  }

  const agreementCoursesPayload = courseIds.map((courseId) => ({
    agreement_id: agreement.id,
    course_id: courseId,
    is_active: true,
  }));

  const { error: courseError } = await supabase
    .from("agreement_courses")
    .insert(agreementCoursesPayload);

  if (courseError) {
    throw new Error(
      `Acordo criado, mas não foi possível vincular os cursos: ${courseError.message}`,
    );
  }

  const inquiryIdsToConvert = (viableCourseInquiries ?? [])
    .map((item) => item.id)
    .filter(Boolean);

  if (inquiryIdsToConvert.length > 0) {
    await supabase
      .from("inquiries")
      .update({ status: "convertida_em_acordo" })
      .in("id", inquiryIdsToConvert);
  }

  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath("/instituicao/acordos");
  revalidatePath("/instituicao/apresentar-estudante");

  redirect("/coordenadoria/acordos-cooperacao?sucesso=1");
}

export async function updateCoordinationAgreement(formData: FormData) {
  const { supabase, profileId } = await requireCoordination();

  const id = normalizeText(formData.get("id"));
  const status = normalizeText(formData.get("status"));
  const legalRepresentativeName = normalizeText(
    formData.get("legal_representative_name"),
  );
  const institutionResponsibleName = normalizeText(
    formData.get("institution_responsible_name"),
  );
  const startedAt = normalizeDate(formData.get("started_at"));
  const endedAt = normalizeDate(formData.get("ended_at"));
  const signedAt = normalizeDate(formData.get("signed_at"));
  const publishedAt = normalizeDate(formData.get("published_at"));
  const publicationReference = normalizeText(formData.get("publication_reference"));
  const documentUrl = normalizeText(formData.get("document_url"));
  const notes = normalizeText(formData.get("notes"));

  if (!id) {
    throw new Error("Acordo não identificado.");
  }

  if (!status || !allowedStatuses.includes(status)) {
    throw new Error("Situação inválida para o acordo.");
  }

  if (!startedAt) {
    throw new Error("Informe o início da vigência do acordo.");
  }

  if (!endedAt) {
    throw new Error("Informe o fim da vigência do acordo.");
  }

  validateDateRange(startedAt, endedAt);

  if (!legalRepresentativeName) {
    throw new Error("Informe o representante legal da instituição.");
  }

  if (!institutionResponsibleName) {
    throw new Error("Informe o responsável institucional pelo estágio.");
  }

  validateActiveAgreement({
    status,
    startedAt,
    endedAt,
    signedAt,
    publishedAt,
    documentUrl,
  });

  const { error } = await supabase
    .from("cooperation_agreements")
    .update({
      status,
      legal_representative_name: legalRepresentativeName,
      institution_responsible_name: institutionResponsibleName,
      started_at: startedAt,
      ended_at: endedAt,
      signed_at: signedAt,
      published_at: publishedAt,
      publication_reference: publicationReference,
      document_url: documentUrl,
      notes,
      reviewed_by: profileId,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar o acordo: ${error.message}`);
  }

  revalidatePath("/coordenadoria/acordos-cooperacao");
  revalidatePath("/instituicao/acordos");
  revalidatePath("/instituicao/apresentar-estudante");

  redirect("/coordenadoria/acordos-cooperacao?sucesso=2");
}

export async function cancelCoordinationAgreementEdit() {
  redirect("/coordenadoria/acordos-cooperacao");
}
