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
    fail(presentationId, studentError?.message ?? "Estudante não encontrado.");
  }

  if (
    student.institution_id !== presentation.institution_id ||
    student.course_id !== presentation.course_id
  ) {
    fail(presentationId, "Os dados do estudante não correspondem à apresentação.");
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
      `Este estudante já possui acesso vinculado ao e-mail ${existingStudentProfile.email}.`,
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
