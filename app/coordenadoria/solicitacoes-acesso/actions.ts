"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

const allowedStatus = [
  "pendente",
  "em_analise",
  "aprovada",
  "rejeitada",
  "cancelada",
];

export async function updateAccessRequestStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const reviewNotes = normalizeText(formData.get("review_notes"));

  if (!id) {
    throw new Error("Solicitação não identificada.");
  }

  if (!allowedStatus.includes(status)) {
    throw new Error("Status inválido para a solicitação.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("access_requests")
    .update({
      status,
      review_notes: reviewNotes,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível atualizar a solicitação: ${error.message}`);
  }

  revalidatePath("/coordenadoria/solicitacoes-acesso");
}

export async function releaseInstitutionAccess(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const id = normalizeText(formData.get("id"));
  const password = normalizeText(formData.get("password"));
  const accessReleaseNotes = normalizeText(formData.get("access_release_notes"));

  if (!id) {
    throw new Error("Solicitação não identificada.");
  }

  if (!password || password.length < 8) {
    throw new Error("Informe uma senha provisória com pelo menos 8 caracteres.");
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", currentUser?.id)
    .single();

  if (
    currentProfileError ||
    !currentProfile ||
    !currentProfile.is_active ||
    !["admin", "coordenadoria"].includes(currentProfile.role)
  ) {
    throw new Error("Usuário sem permissão para liberar acesso institucional.");
  }

  const { data: request, error: requestError } = await supabase
    .from("access_requests")
    .select(
      "id, requester_name, requester_email, institution_name, status, access_released",
    )
    .eq("id", id)
    .single();

  if (requestError || !request) {
    throw new Error("Solicitação não encontrada.");
  }

  if (request.status !== "aprovada") {
    throw new Error("A solicitação precisa estar aprovada antes de liberar acesso.");
  }

  if (request.access_released) {
    throw new Error("O acesso desta solicitação já foi liberado.");
  }

  const email = request.requester_email.trim().toLowerCase();

  const { data: createdUser, error: createUserError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: request.requester_name,
        institution_name: request.institution_name,
        source: "access_request",
        access_request_id: request.id,
      },
    });

  if (createUserError || !createdUser.user) {
    throw new Error(
      `Não foi possível criar o usuário institucional: ${createUserError?.message}`,
    );
  }

  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: createdUser.user.id,
    full_name: request.requester_name,
    email,
    role: "instituicao",
    institution_id: null,
    is_active: true,
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    throw new Error(
      `Usuário Auth criado, mas não foi possível criar o profile. O usuário foi removido. Detalhe: ${profileError.message}`,
    );
  }

  const { error: releaseError } = await supabase
    .from("access_requests")
    .update({
      status: "aprovada",
      access_released: true,
      access_released_at: new Date().toISOString(),
      access_released_by: currentUser?.id ?? null,
      access_release_notes:
        accessReleaseNotes ??
        "Usuário institucional criado e profile liberado pelo sistema.",
    })
    .eq("id", id);

  if (releaseError) {
    throw new Error(
      `Usuário institucional criado, mas não foi possível registrar a liberação: ${releaseError.message}`,
    );
  }

  revalidatePath("/coordenadoria/solicitacoes-acesso");
}
