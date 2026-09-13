"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeCpf(value: FormDataEntryValue | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function isValidCpf(value: string | null) {
  if (!value || value.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(value)) {
    return false;
  }

  const digits = value.split("").map(Number);

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += digits[index] * (10 - index);
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) {
    firstDigit = 0;
  }

  if (firstDigit !== digits[9]) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += digits[index] * (11 - index);
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) {
    secondDigit = 0;
  }

  return secondDigit === digits[10];
}

function calculateAge(birthDate: string, referenceDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const reference = new Date(`${referenceDate}T00:00:00`);

  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && reference.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function normalizePositiveNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

function normalizeNonNegativeInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return 0;
  }

  const number = Number.parseInt(text, 10);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function normalizeWeekDays(values: FormDataEntryValue[]) {
  const allowed = new Set([
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ]);

  return values
    .map((value) => String(value))
    .filter((value) => allowed.has(value));
}

function fail(message: string): never {
  redirect(`/instituicao/apresentar-estudante?erro=${encodeURIComponent(message)}`);
}

function dateIsBefore(left: string, right: string) {
  return left.slice(0, 10) < right.slice(0, 10);
}

function dateIsAfter(left: string, right: string) {
  return left.slice(0, 10) > right.slice(0, 10);
}

function getRequiredPdf(formData: FormData, fieldName: string, label: string) {
  const value = formData.get(fieldName);

  if (!(value instanceof File) || value.size === 0) {
    fail(`Anexe o documento: ${label}.`);
  }

  if (value.size > MAX_FILE_SIZE) {
    fail(`O arquivo "${label}" deve ter no máximo 10MB.`);
  }

  if (value.type && value.type !== "application/pdf") {
    fail(`O arquivo "${label}" deve estar em PDF.`);
  }

  return value;
}

function getOptionalPdf(formData: FormData, fieldName: string, label: string) {
  const value = formData.get(fieldName);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > MAX_FILE_SIZE) {
    fail(`O arquivo "${label}" deve ter no máximo 10MB.`);
  }

  if (value.type && value.type !== "application/pdf") {
    fail(`O arquivo "${label}" deve estar em PDF.`);
  }

  return value;
}

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

async function uploadStudentDocument({
  supabase,
  file,
  presentationId,
  documentType,
  uploadedBy,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  file: File;
  presentationId: string;
  documentType: string;
  uploadedBy: string;
}) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const filePath = `${presentationId}/${documentType}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("student-documents")
    .upload(filePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    fail(`Erro ao enviar ${safeFileName(file.name)}: ${uploadError.message}`);
  }

  const { data: document, error: documentError } = await supabase
    .from("student_documents")
    .insert({
      presentation_id: presentationId,
      document_type: documentType,
      file_path: filePath,
      status: "enviado",
      uploaded_by: uploadedBy,
    })
    .select("id")
    .single();

  if (documentError || !document) {
    fail(documentError?.message ?? `Não foi possível registrar o documento ${documentType}.`);
  }

  return document.id as string;
}

export async function submitStudentPresentation(formData: FormData) {
  const supabase = await createClient();

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
    .select("id, role, institution_id, is_active")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    fail(profileError?.message ?? "Perfil não encontrado.");
  }

  if (
    !profile.is_active ||
    profile.role !== "instituicao" ||
    !profile.institution_id
  ) {
    fail("Apenas instituição ativa pode apresentar estagiário.");
  }

  const authorizationKey = normalizeText(formData.get("authorization_key"));

  if (!authorizationKey) {
    fail("Selecione uma sondagem autorizada.");
  }

  const [agreementId, inquiryId, courseId, municipalUnitId] =
    authorizationKey.split("|");

  if (!agreementId || !inquiryId || !courseId || !municipalUnitId) {
    fail("Vínculo da apresentação inválido.");
  }

  const fullName = normalizeText(formData.get("full_name"));
  const cpf = normalizeCpf(formData.get("cpf"));
  const identityDocument = normalizeText(formData.get("identity_document"));
  const identityIssuer = normalizeText(formData.get("identity_issuer"));
  const email = normalizeText(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const birthDate = normalizeText(formData.get("birth_date"));
  const address = normalizeText(formData.get("address"));
  const academicRegistration = normalizeText(formData.get("academic_registration"));
  const academicPeriod = normalizeText(formData.get("academic_period"));

  const termNumber = normalizeText(formData.get("term_number"));
  const termSignedAt = normalizeText(formData.get("term_signed_at"));
  const internshipType = normalizeText(formData.get("internship_type")) ?? "obrigatorio";
  const professorAdvisorName = normalizeText(formData.get("professor_advisor_name"));
  const professorAdvisorEmail = normalizeText(formData.get("professor_advisor_email"));
  const internshipLocation = normalizeText(formData.get("internship_location"));
  const activitiesPlan = normalizeText(formData.get("activities_plan"));

  const internshipStartDate = normalizeText(formData.get("internship_start_date"));
  const internshipEndDate = normalizeText(formData.get("internship_end_date"));
  const requiredWorkload = normalizePositiveNumber(formData.get("required_workload"));
  const supervisorName = normalizeText(formData.get("supervisor_name"));

  const weeklyDays = normalizeWeekDays(formData.getAll("weekly_days"));
  const dailyStartTime = normalizeText(formData.get("daily_start_time"));
  const dailyEndTime = normalizeText(formData.get("daily_end_time"));
  const breakMinutes = normalizeNonNegativeInteger(formData.get("break_minutes"));

  const calculatedDailyWorkload = normalizePositiveNumber(
    formData.get("calculated_daily_workload"),
  );
  const calculatedWeeklyWorkload = normalizePositiveNumber(
    formData.get("calculated_weekly_workload"),
  );
  const maximumPossibleWorkload = normalizePositiveNumber(
    formData.get("maximum_possible_workload"),
  );

  const internshipSchedule =
    dailyStartTime && dailyEndTime
      ? `${dailyStartTime} às ${dailyEndTime}${
          breakMinutes > 0 ? `, intervalo de ${breakMinutes} minuto(s)` : ""
        }`
      : null;

  const insuranceCompany = normalizeText(formData.get("insurance_company"));
  const policyNumber = normalizeText(formData.get("policy_number"));
  const insuranceValidFrom = normalizeText(formData.get("insurance_valid_from"));
  const insuranceValidUntil = normalizeText(formData.get("insurance_valid_until"));

  const notes = normalizeText(formData.get("notes"));

  if (!fullName) {
    fail("Informe o nome completo do estagiário.");
  }

  if (!cpf) {
    fail("Informe o CPF do estagiário.");
  }

  if (!isValidCpf(cpf)) {
    fail("Informe um CPF válido para o estagiário.");
  }

  if (!identityDocument) {
    fail("Informe o RG/documento de identificação do estagiário.");
  }

  if (!identityIssuer) {
    fail("Informe o órgão expedidor do documento de identificação.");
  }

  if (!email) {
    fail("Informe o e-mail do estagiário.");
  }

  if (!phone) {
    fail("Informe o telefone do estagiário.");
  }

  if (!birthDate) {
    fail("Informe a data de nascimento do estagiário.");
  }

  if (!address) {
    fail("Informe o endereço completo do estagiário.");
  }

  const todayForBirthDate = new Date().toISOString().slice(0, 10);

  if (birthDate && birthDate >= todayForBirthDate) {
    fail("A data de nascimento do estagiário não pode ser a data atual ou futura.");
  }

  if (birthDate && calculateAge(birthDate, todayForBirthDate) < 16) {
    fail("A idade do estagiário deve ser compatível com a realização do estágio.");
  }

  if (!academicRegistration) {
    fail("Informe a matrícula acadêmica do estagiário.");
  }

  if (!academicPeriod) {
    fail("Informe o período/semestre acadêmico do estagiário.");
  }

  if (!["obrigatorio", "nao_obrigatorio"].includes(internshipType)) {
    fail("Informe um tipo de estágio válido.");
  }

  if (!professorAdvisorName) {
    fail("Informe o professor orientador da instituição de ensino.");
  }

  if (!internshipLocation) {
    fail("Informe o local/setor previsto para o estágio.");
  }

  if (!activitiesPlan) {
    fail("Informe o plano de atividades previsto no Termo de Compromisso.");
  }

  if (!internshipStartDate) {
    fail("Informe a data de início prevista no Termo de Compromisso.");
  }

  if (!internshipEndDate) {
    fail("Informe a data de término prevista no Termo de Compromisso.");
  }

  if (dateIsAfter(internshipStartDate, internshipEndDate)) {
    fail("A data de início do estágio não pode ser posterior à data de término.");
  }

  if (weeklyDays.length === 0) {
    fail("Selecione ao menos um dia da semana previsto no Termo de Compromisso.");
  }

  if (!dailyStartTime || !dailyEndTime || !internshipSchedule) {
    fail("Informe o horário previsto no Termo de Compromisso.");
  }

  if (dailyEndTime <= dailyStartTime) {
    fail("O horário de saída deve ser posterior ao horário de entrada.");
  }

  if (!calculatedDailyWorkload || !calculatedWeeklyWorkload || !maximumPossibleWorkload) {
    fail("Não foi possível calcular a carga horária possível no período.");
  }

  if (calculatedDailyWorkload > 6) {
    fail("A jornada diária não pode ultrapassar 6 horas.");
  }

  if (calculatedWeeklyWorkload > 30) {
    fail("A jornada semanal não pode ultrapassar 30 horas.");
  }

  const requiredWorkloadValue = Number(requiredWorkload);

  if (maximumPossibleWorkload < requiredWorkloadValue) {
    fail(
      `O período e horário informados comportam aproximadamente ${maximumPossibleWorkload}h, mas a carga obrigatória é de ${requiredWorkloadValue}h.`,
    );
  }

  if (!requiredWorkload) {
    fail("Informe a carga horária obrigatória.");
  }


  if (!supervisorName) {
    fail("Informe o supervisor previsto no Termo de Compromisso.");
  }

  if (!insuranceCompany) {
    fail("Informe a seguradora.");
  }

  if (!policyNumber) {
    fail("Informe o número da apólice.");
  }

  if (!insuranceValidFrom) {
    fail("Informe o início da vigência do seguro.");
  }

  if (!insuranceValidUntil) {
    fail("Informe o fim da vigência do seguro.");
  }

  if (dateIsAfter(insuranceValidFrom, insuranceValidUntil)) {
    fail("O início da vigência do seguro não pode ser posterior ao fim da vigência.");
  }

  if (dateIsAfter(insuranceValidFrom, internshipStartDate)) {
    fail("O seguro não cobre a data de início prevista para o estágio.");
  }

  if (dateIsBefore(insuranceValidUntil, internshipEndDate)) {
    fail("O seguro deve cobrir todo o período previsto para o estágio.");
  }

  const presentationLetterFile = getOptionalPdf(
    formData,
    "presentation_letter_file",
    "Carta de apresentação",
  );

  const commitmentTermFile = getOptionalPdf(
    formData,
    "commitment_term_file",
    "Termo de Compromisso",
  );

  const insuranceFile = getOptionalPdf(
    formData,
    "insurance_file",
    "Apólice/seguro",
  );

  const enrollmentFile = getOptionalPdf(
    formData,
    "enrollment_file",
    "Comprovante de matrícula",
  );

  const identificationFile = getOptionalPdf(
    formData,
    "identification_file",
    "Documento de identificação",
  );

  const activitiesPlanFile = getOptionalPdf(
    formData,
    "activities_plan_file",
    "Plano de atividades",
  );

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, institution_id, course_id, status, coordination_decision, coordination_approved_students, required_workload, intended_period")
    .eq("id", inquiryId)
    .eq("institution_id", profile.institution_id)
    .single();

  if (inquiryError || !inquiry) {
    fail(inquiryError?.message ?? "Sondagem não encontrada.");
  }

  if (inquiry.course_id !== courseId) {
    fail("O curso informado não corresponde à sondagem.");
  }

  const isViable =
    inquiry.status === "viavel" ||
    inquiry.status === "viavel_parcial" ||
    inquiry.coordination_decision === "viavel" ||
    inquiry.coordination_decision === "parcialmente_viavel";

  const approvedStudents = inquiry.coordination_approved_students ?? 0;

  if (!isViable || approvedStudents <= 0) {
    fail("A sondagem selecionada não possui quantidade autorizada para apresentação de estagiário.");
  }

  const inquiryWorkload = Number(inquiry.required_workload ?? 0);

  if (inquiryWorkload <= 0) {
    fail("A sondagem selecionada não possui carga horária autorizada.");
  }

  if (inquiryWorkload !== requiredWorkloadValue) {
    fail("A carga horária deve corresponder à carga horária autorizada na sondagem.");
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("cooperation_agreements")
    .select("id, institution_id, status, signed_at, published_at, started_at, ended_at")
    .eq("id", agreementId)
    .eq("institution_id", profile.institution_id)
    .single();

  if (agreementError || !agreement) {
    fail(agreementError?.message ?? "Acordo de Cooperação não encontrado.");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (
    agreement.status !== "ativo" ||
    !agreement.signed_at ||
    !agreement.published_at ||
    (agreement.started_at && agreement.started_at > today) ||
    (agreement.ended_at && agreement.ended_at < today)
  ) {
    fail("A apresentação exige acordo ativo, assinado, publicado e vigente.");
  }

  if (agreement.started_at && dateIsBefore(internshipStartDate, agreement.started_at)) {
    fail("O início previsto do estágio não pode ser anterior à vigência do acordo.");
  }

  if (agreement.ended_at && dateIsAfter(internshipEndDate, agreement.ended_at)) {
    fail("O término previsto do estágio não pode ultrapassar a vigência do acordo.");
  }

  const { data: agreementCourse, error: agreementCourseError } = await supabase
    .from("agreement_courses")
    .select("id")
    .eq("agreement_id", agreementId)
    .eq("course_id", courseId)
    .eq("is_active", true)
    .maybeSingle();

  if (agreementCourseError || !agreementCourse) {
    fail("O curso do estagiário não está abrangido pelo acordo.");
  }

  const { data: response, error: responseError } = await supabase
    .from("inquiry_unit_responses")
    .select("id, available_slots, response_status")
    .eq("inquiry_id", inquiryId)
    .eq("municipal_unit_id", municipalUnitId)
    .maybeSingle();

  if (responseError || !response) {
    fail("A unidade municipal selecionada não possui resposta vinculada à sondagem.");
  }

  const hasUnitAvailability =
    Number(response.available_slots ?? 0) > 0 ||
    ["campo_disponivel", "campo_com_limite"].includes(response.response_status);

  if (!hasUnitAvailability) {
    fail("A unidade municipal selecionada não possui disponibilidade registrada.");
  }

  const { data: existingPresentations, error: countError } = await supabase
    .from("student_presentations")
    .select("id, status")
    .eq("institution_id", profile.institution_id)
    .eq("inquiry_id", inquiryId);

  if (countError) {
    fail(countError.message);
  }

  const activePresentations = (existingPresentations ?? []).filter(
    (item) => !["cancelado", "indeferido"].includes(item.status),
  );

  if (activePresentations.length >= approvedStudents) {
    fail("A quantidade autorizada para esta sondagem já foi atingida.");
  }

  let studentId: string | null = null;

  if (cpf) {
    const { data: existingStudent, error: existingStudentError } = await supabase
      .from("students")
      .select("id, institution_id, course_id")
      .eq("cpf", cpf)
      .maybeSingle();

    if (existingStudentError) {
      fail(existingStudentError.message);
    }

    if (existingStudent) {
      if (
        existingStudent.institution_id !== profile.institution_id ||
        existingStudent.course_id !== courseId
      ) {
        fail("Já existe estagiário com este CPF vinculado a outra instituição ou curso.");
      }

      studentId = existingStudent.id;

      const { error: updateStudentError } = await supabase
        .from("students")
        .update({
          full_name: fullName,
          cpf,
          identity_document: identityDocument,
          identity_issuer: identityIssuer,
          email,
          phone,
          birth_date: birthDate,
          address,
          academic_registration: academicRegistration,
        })
        .eq("id", studentId);

      if (updateStudentError) {
        fail(updateStudentError.message);
      }
    }
  }

  if (!studentId) {
    const { data: newStudent, error: studentError } = await supabase
      .from("students")
      .insert({
        full_name: fullName,
        cpf,
        identity_document: identityDocument,
        identity_issuer: identityIssuer,
        email,
        phone,
        birth_date: birthDate,
        address,
        institution_id: profile.institution_id,
        course_id: courseId,
        academic_registration: academicRegistration,
      })
      .select("id")
      .single();

    if (studentError || !newStudent) {
      fail(studentError?.message ?? "Não foi possível cadastrar o estagiário.");
    }

    studentId = newStudent.id;
  }

  const { data: presentation, error: presentationError } = await supabase
    .from("student_presentations")
    .insert({
      student_id: studentId,
      institution_id: profile.institution_id,
      course_id: courseId,
      agreement_id: agreementId,
      inquiry_id: inquiryId,
      municipal_unit_id: municipalUnitId,
      intended_period: `${internshipStartDate} a ${internshipEndDate}`,
      intended_schedule: internshipSchedule,
      required_workload: requiredWorkloadValue,
      status: "apresentado",
      submitted_by: userId,
    })
    .select("id")
    .single();

  if (presentationError || !presentation) {
    fail(presentationError?.message ?? "Não foi possível registrar a apresentação.");
  }

  const presentationId = presentation.id as string;

  const presentationLetterDocumentId = presentationLetterFile
    ? await uploadStudentDocument({
        supabase,
        file: presentationLetterFile,
        presentationId,
        documentType: "carta_apresentacao",
        uploadedBy: userId,
      })
    : null;

  if (enrollmentFile) {
    await uploadStudentDocument({
      supabase,
      file: enrollmentFile,
      presentationId,
      documentType: "comprovante_matricula",
      uploadedBy: userId,
    });
  }

  if (identificationFile) {
    await uploadStudentDocument({
      supabase,
      file: identificationFile,
      presentationId,
      documentType: "documento_identificacao",
      uploadedBy: userId,
    });
  }

  if (activitiesPlanFile) {
    await uploadStudentDocument({
      supabase,
      file: activitiesPlanFile,
      presentationId,
      documentType: "plano_atividades",
      uploadedBy: userId,
    });
  }

  const termDocumentId = commitmentTermFile
    ? await uploadStudentDocument({
        supabase,
        file: commitmentTermFile,
        presentationId,
        documentType: "termo_compromisso",
        uploadedBy: userId,
      })
    : null;

  const insuranceDocumentId = insuranceFile
    ? await uploadStudentDocument({
        supabase,
        file: insuranceFile,
        presentationId,
        documentType: "seguro",
        uploadedBy: userId,
      })
    : null;

  const { error: commitmentTermError } = await supabase
    .from("commitment_terms")
    .insert({
      presentation_id: presentationId,
      student_id: studentId,
      institution_id: profile.institution_id,
      course_id: courseId,
      agreement_id: agreementId,
      municipal_unit_id: municipalUnitId,
      term_document_id: termDocumentId,
      insurance_document_id: insuranceDocumentId,
      status: "enviado",
      term_number: termNumber,
      term_signed_at: termSignedAt,
      internship_type: internshipType,
      academic_period: academicPeriod,
      professor_advisor_name: professorAdvisorName,
      professor_advisor_email: professorAdvisorEmail,
      internship_location: internshipLocation,
      activities_plan: activitiesPlan,
      policy_number: policyNumber,
      insurance_company: insuranceCompany,
      insurance_valid_from: insuranceValidFrom,
      insurance_valid_until: insuranceValidUntil,
      internship_start_date: internshipStartDate,
      internship_end_date: internshipEndDate,
      internship_schedule: internshipSchedule,
      required_workload: requiredWorkloadValue,
      weekly_days: weeklyDays,
      daily_start_time: dailyStartTime,
      daily_end_time: dailyEndTime,
      break_minutes: breakMinutes,
      daily_workload: calculatedDailyWorkload,
      weekly_workload: calculatedWeeklyWorkload,
      maximum_possible_workload: maximumPossibleWorkload,
      supervisor_name: supervisorName,
      notes: presentationLetterDocumentId
        ? notes
          ? `${notes}\n\nCarta de apresentação: ${presentationLetterDocumentId}`
          : `Carta de apresentação: ${presentationLetterDocumentId}`
        : notes,
      submitted_by: userId,
      submitted_at: new Date().toISOString(),
    });

  if (commitmentTermError) {
    fail(commitmentTermError.message);
  }

  revalidatePath("/instituicao/apresentar-estudante");
  revalidatePath("/instituicao/estudantes");
  revalidatePath("/coordenadoria/estudantes");
  revalidatePath("/coordenadoria/autorizacoes");

  redirect("/instituicao/apresentar-estudante?sucesso=1");
}
