"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeCpf(value: FormDataEntryValue | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function normalizePositiveInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number.parseInt(text, 10);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

function fail(message: string): never {
  redirect(`/instituicao/apresentar-estudante?erro=${encodeURIComponent(message)}`);
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
    fail("Apenas instituição ativa pode apresentar estudantes.");
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
  const email = normalizeText(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const birthDate = normalizeText(formData.get("birth_date"));
  const academicRegistration = normalizeText(
    formData.get("academic_registration"),
  );
  const intendedPeriod = normalizeText(formData.get("intended_period"));
  const intendedSchedule = normalizeText(formData.get("intended_schedule"));
  const requiredWorkload = normalizePositiveInteger(
    formData.get("required_workload"),
  );

  if (!fullName) {
    fail("Informe o nome completo do estudante.");
  }

  if (!email) {
    fail("Informe o e-mail do estudante.");
  }

  if (!academicRegistration) {
    fail("Informe a matrícula acadêmica do estudante.");
  }

  if (!intendedPeriod) {
    fail("Informe o período pretendido para o estágio.");
  }

  if (!intendedSchedule) {
    fail("Informe o horário pretendido para o estágio.");
  }

  if (!requiredWorkload) {
    fail("Informe a carga horária obrigatória.");
  }

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
    fail("A sondagem selecionada não possui quantidade autorizada para apresentação de estudante.");
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

  const { data: agreementCourse, error: agreementCourseError } = await supabase
    .from("agreement_courses")
    .select("id")
    .eq("agreement_id", agreementId)
    .eq("course_id", courseId)
    .eq("is_active", true)
    .maybeSingle();

  if (agreementCourseError || !agreementCourse) {
    fail("O curso do estudante não está abrangido pelo acordo.");
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
        fail("Já existe estudante com este CPF vinculado a outra instituição ou curso.");
      }

      studentId = existingStudent.id;

      const { error: updateStudentError } = await supabase
        .from("students")
        .update({
          full_name: fullName,
          email,
          phone,
          birth_date: birthDate,
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
        email,
        phone,
        birth_date: birthDate,
        institution_id: profile.institution_id,
        course_id: courseId,
        academic_registration: academicRegistration,
      })
      .select("id")
      .single();

    if (studentError || !newStudent) {
      fail(studentError?.message ?? "Não foi possível cadastrar o estudante.");
    }

    studentId = newStudent.id;
  }

  const { error: presentationError } = await supabase
    .from("student_presentations")
    .insert({
      student_id: studentId,
      institution_id: profile.institution_id,
      course_id: courseId,
      agreement_id: agreementId,
      inquiry_id: inquiryId,
      municipal_unit_id: municipalUnitId,
      intended_period: intendedPeriod,
      intended_schedule: intendedSchedule,
      required_workload: requiredWorkload,
      status: "apresentado",
      submitted_by: userId,
    });

  if (presentationError) {
    fail(presentationError.message);
  }

  revalidatePath("/instituicao/apresentar-estudante");
  revalidatePath("/coordenadoria/estudantes");

  redirect("/instituicao/apresentar-estudante?sucesso=1");
}


