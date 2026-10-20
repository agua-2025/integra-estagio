"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateAuthorizationPlan } from "@/lib/authorization-planning";
import { createClient } from "@/lib/supabase/server";

const documentFields = [
  ["presentation_letter_file", "carta_apresentacao", "Carta de apresentação"],
  ["commitment_term_file", "termo_compromisso", "Termo de Compromisso"],
  ["insurance_file", "seguro", "Apólice/seguro"],
  ["enrollment_file", "comprovante_matricula", "Comprovante de matrícula"],
  ["identification_file", "documento_identificacao", "Documento de identificação"],
  ["activities_plan_file", "plano_atividades", "Plano de atividades"],
] as const;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function fail(id: string, message: string): never {
  redirect(`/instituicao/apresentacoes/${id}/correcao?erro=${encodeURIComponent(message)}`);
}

function required(formData: FormData, name: string, label: string, id: string) {
  const value = text(formData, name);
  if (!value) fail(id, `Informe: ${label}.`);
  return value;
}

function validCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const length of [9, 10]) {
    const sum = [...cpf.slice(0, length)].reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index), 0
    );
    const check = (11 - (sum % 11)) % 11;
    if (check !== Number(cpf[length])) return false;
  }
  return true;
}

async function pdf(formData: FormData, field: string, label: string, id: string) {
  const value = formData.get(field);
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > 10 * 1024 * 1024) fail(id, `${label}: limite de 10 MB.`);
  if (value.type && value.type !== "application/pdf") fail(id, `${label}: use PDF.`);
  const bytes = new Uint8Array(await value.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...bytes) !== "%PDF-") fail(id, `${label}: PDF inválido.`);
  return value;
}

export async function resubmitPresentation(id: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) fail(id, "Sessão expirada.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active, institution_id")
    .eq("id", user.id)
    .single();

  if (
    profileError || !profile?.is_active ||
    profile.role !== "instituicao" || !profile.institution_id
  ) fail(id, "Instituição sem permissão para corrigir esta apresentação.");

  const { data: presentation, error: presentationError } = await supabase
    .from("student_presentations")
    .select("id, student_id, institution_id, agreement_id, inquiry_id, course_id, municipal_unit_id, required_workload, status")
    .eq("id", id)
    .eq("institution_id", profile.institution_id)
    .eq("status", "pendente_correcao")
    .single();

  if (presentationError || !presentation) {
    fail(id, "Esta apresentação não está disponível para correção.");
  }

  const binding = [
    presentation.agreement_id, presentation.inquiry_id,
    presentation.course_id, presentation.municipal_unit_id,
  ].join("|");
  if (text(formData, "authorization_key") !== binding) {
    fail(id, "O vínculo da apresentação não pode ser alterado.");
  }

  const fullName = required(formData, "full_name", "nome completo", id);
  const cpf = required(formData, "cpf", "CPF", id).replace(/\D/g, "");
  if (!validCpf(cpf)) fail(id, "Informe um CPF válido.");

  const identityDocument = text(formData, "identity_document") || null;
  const identityIssuer = text(formData, "identity_issuer") || null;
  const email = required(formData, "email", "e-mail", id);
  const phone = required(formData, "phone", "telefone", id);
  const birthDate = required(formData, "birth_date", "data de nascimento", id);
  const address = required(formData, "address", "endereço", id);
  const academicRegistration = required(formData, "academic_registration", "matrícula", id);
  const academicPeriod = required(formData, "academic_period", "período acadêmico", id);

  const today = new Date().toISOString().slice(0, 10);
  const birth = new Date(`${birthDate}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  if (
    Number.isNaN(birth.getTime()) || birthDate >= today ||
    current.getFullYear() - birth.getFullYear() -
      (today.slice(5) < birthDate.slice(5) ? 1 : 0) < 16
  ) fail(id, "Confira a data de nascimento do estagiário.");

  const internshipType = required(formData, "internship_type", "tipo de estágio", id);
  if (!["obrigatorio", "nao_obrigatorio"].includes(internshipType)) {
    fail(id, "Tipo de estágio inválido.");
  }

  const professorAdvisorName = required(formData, "professor_advisor_name", "professor orientador", id);
  const internshipLocation = required(formData, "internship_location", "local do estágio", id);
  const activitiesPlan = required(formData, "activities_plan", "plano de atividades", id);
  const supervisorName = required(formData, "supervisor_name", "supervisor", id);

  const startDate = required(formData, "internship_start_date", "início do estágio", id);
  const endDate = required(formData, "internship_end_date", "término do estágio", id);
  if (startDate > endDate) fail(id, "O início do estágio é posterior ao término.");

  const requiredWorkload = Number(text(formData, "required_workload"));
  if (
    !Number.isFinite(requiredWorkload) || requiredWorkload <= 0 ||
    requiredWorkload !== Number(presentation.required_workload)
  ) fail(id, "A carga horária deve corresponder à apresentação original.");

  const allowedDays = new Set([
    "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo",
  ]);
  const days = [...new Set(
    formData.getAll("weekly_days")
      .filter((value): value is string => typeof value === "string")
      .filter((value) => allowedDays.has(value))
  )];
  if (!days.length) fail(id, "Selecione os dias da semana.");

  const dailyStart = required(formData, "daily_start_time", "horário de entrada", id);
  const dailyEnd = required(formData, "daily_end_time", "horário de saída", id);
  const breakMinutes = Number(text(formData, "break_minutes") || "0");
  if (
    !/^\d{2}:\d{2}$/.test(dailyStart) ||
    !/^\d{2}:\d{2}$/.test(dailyEnd) ||
    dailyEnd <= dailyStart ||
    !Number.isInteger(breakMinutes) || breakMinutes < 0
  ) fail(id, "Confira os horários e o intervalo.");

  const toMinutes = (value: string) =>
    Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const dailyMinutes = toMinutes(dailyEnd) - toMinutes(dailyStart) - breakMinutes;
  if (dailyMinutes <= 0 || dailyMinutes > 360 || dailyMinutes * days.length > 1800) {
    fail(id, "A jornada não pode ultrapassar 6 horas diárias ou 30 horas semanais.");
  }

  const insuranceCompany = required(formData, "insurance_company", "seguradora", id);
  const policyNumber = required(formData, "policy_number", "número da apólice", id);
  const insuranceFrom = required(formData, "insurance_valid_from", "início do seguro", id);
  const insuranceUntil = required(formData, "insurance_valid_until", "fim do seguro", id);
  if (insuranceFrom > startDate || insuranceUntil < endDate) {
    fail(id, "O seguro deve cobrir todo o período do estágio.");
  }

  const [studentResult, termResult, documentsResult, agreementResult, calendarResult] =
    await Promise.all([
      supabase.from("students")
        .select("id").eq("id", presentation.student_id)
        .eq("institution_id", profile.institution_id).single(),
      supabase.from("commitment_terms")
        .select("id, status").eq("presentation_id", id)
        .eq("institution_id", profile.institution_id)
        .not("status", "in", "(cancelado,substituido)").single(),
      supabase.from("student_documents")
        .select("id, document_type, status, created_at")
        .eq("presentation_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("cooperation_agreements")
        .select("id, status, started_at, ended_at")
        .eq("id", presentation.agreement_id)
        .eq("institution_id", profile.institution_id).single(),
      supabase.from("unit_calendar_exceptions")
        .select("start_date, end_date")
        .or(`municipal_unit_id.is.null,municipal_unit_id.eq.${presentation.municipal_unit_id}`),
    ]);

  const queryError =
    studentResult.error ?? termResult.error ?? documentsResult.error ??
    agreementResult.error ?? calendarResult.error;
  if (queryError) fail(id, queryError.message);

  if (!studentResult.data || !termResult.data) fail(id, "Estudante ou termo não localizado.");
  if (!["enviado", "rascunho", "pendente_correcao"].includes(termResult.data.status)) {
    fail(id, "O termo já passou desta etapa. Solicite orientação à Coordenadoria.");
  }
  const agreement = agreementResult.data;
  if (
    !agreement || agreement.status !== "ativo" ||
    (agreement.started_at && startDate < agreement.started_at) ||
    (agreement.ended_at && endDate > agreement.ended_at)
  ) fail(id, "O período informado precisa estar dentro de um acordo ativo.");

  const plan = calculateAuthorizationPlan({
    startDate, endDate, weeklyDays: days,
    startTime: dailyStart, endTime: dailyEnd,
    breakMinutes, requiredHours: requiredWorkload,
    exceptions: calendarResult.data ?? [],
  });
  if (!plan.valid || !plan.sufficient) {
    fail(id, "O período e a jornada não comportam a carga horária exigida. Confira o calendário.");
  }

  const existing = documentsResult.data ?? [];
  const incoming = new Map<string, File>();
  for (const [field, type, label] of documentFields) {
    const file = await pdf(formData, field, label, id);
    const current = existing.find(
      (doc) => doc.document_type === type &&
        ["enviado", "validado"].includes(doc.status)
    );
    if (file && existing.some(
      (doc) => doc.document_type === type && doc.status === "validado"
    )) fail(id, `${label} já foi validado e não pode ser substituído.`);
    if (file) incoming.set(type, file);
    if (type !== "plano_atividades" && !file && !current) {
      fail(id, `Anexe o documento obrigatório: ${label}.`);
    }
  }

  const activeDocuments = new Map<string, string>();
  for (const doc of existing) {
    if (
      ["enviado", "validado"].includes(doc.status) &&
      !activeDocuments.has(doc.document_type)
    ) activeDocuments.set(doc.document_type, doc.id);
  }

  for (const [type, file] of incoming) {
    const path = `${id}/${type}-${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("student-documents")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (uploadError) fail(id, uploadError.message);

    const { data: document, error: insertError } = await supabase
      .from("student_documents")
      .insert({
        presentation_id: id, document_type: type,
        file_path: path, status: "enviado", uploaded_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !document) {
      await supabase.storage.from("student-documents").remove([path]);
      fail(id, insertError?.message ?? "Não foi possível registrar o documento.");
    }
    activeDocuments.set(type, document.id);
  }

  const schedule = `${dailyStart} às ${dailyEnd}${
    breakMinutes ? `, intervalo de ${breakMinutes} minuto(s)` : ""
  }`;
  const { data: changedTerm, error: termError } = await supabase
    .from("commitment_terms")
    .update({
      term_document_id: activeDocuments.get("termo_compromisso"),
      insurance_document_id: activeDocuments.get("seguro"),
      status: "enviado",
      term_number: text(formData, "term_number") || null,
      term_signed_at: text(formData, "term_signed_at") || null,
      internship_type: internshipType,
      academic_period: academicPeriod,
      professor_advisor_name: professorAdvisorName,
      professor_advisor_email: text(formData, "professor_advisor_email") || null,
      internship_location: internshipLocation,
      activities_plan: activitiesPlan,
      policy_number: policyNumber,
      insurance_company: insuranceCompany,
      insurance_valid_from: insuranceFrom,
      insurance_valid_until: insuranceUntil,
      internship_start_date: startDate,
      internship_end_date: endDate,
      internship_schedule: schedule,
      required_workload: requiredWorkload,
      weekly_days: days,
      daily_start_time: dailyStart,
      daily_end_time: dailyEnd,
      break_minutes: breakMinutes,
      daily_workload: Number((dailyMinutes / 60).toFixed(2)),
      weekly_workload: Number((dailyMinutes * days.length / 60).toFixed(2)),
      maximum_possible_workload: Number((plan.availableMinutes / 60).toFixed(2)),
      supervisor_name: supervisorName,
      notes: text(formData, "notes") || null,
      submitted_by: user.id,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", termResult.data.id)
    .select("id")
    .single();
  if (termError || !changedTerm) {
    fail(id, termError?.message ?? "Não foi possível atualizar o termo.");
  }

  const { data: changedStudent, error: studentError } = await supabase
    .from("students")
    .update({
      full_name: fullName, cpf, identity_document: identityDocument,
      identity_issuer: identityIssuer, email, phone,
      birth_date: birthDate, address,
      academic_registration: academicRegistration,
    })
    .eq("id", presentation.student_id)
    .eq("institution_id", profile.institution_id)
    .select("id")
    .single();
  if (studentError || !changedStudent) {
    fail(id, studentError?.message ?? "Não foi possível atualizar o estudante.");
  }

  for (const type of incoming.keys()) {
    const oldIds = existing
      .filter((doc) =>
        doc.document_type === type &&
        doc.status !== "substituido" &&
        doc.status !== "validado"
      )
      .map((doc) => doc.id);
    if (!oldIds.length) continue;
    const { error } = await supabase
      .from("student_documents")
      .update({ status: "substituido" })
      .in("id", oldIds);
    if (error) fail(id, error.message);
  }

  const { data: changedPresentation, error: updateError } = await supabase
    .from("student_presentations")
    .update({
      status: "apresentado",
      intended_period: `${startDate} a ${endDate}`,
      intended_schedule: schedule,
      submitted_by: user.id,
    })
    .eq("id", id)
    .eq("institution_id", profile.institution_id)
    .eq("status", "pendente_correcao")
    .select("id")
    .single();
  if (updateError || !changedPresentation) {
    fail(id, updateError?.message ?? "Não foi possível reenviar a apresentação.");
  }

  revalidatePath("/instituicao/estudantes");
  revalidatePath("/coordenadoria/estudantes");
  revalidatePath(`/coordenadoria/estudantes/${id}/analise`);
  redirect("/instituicao/estudantes?sucesso_correcao=1");
}
