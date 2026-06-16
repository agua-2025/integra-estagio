"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

async function ensureCoordinationPermission() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    !profile.is_active ||
    !["admin", "coordenadoria"].includes(profile.role)
  ) {
    throw new Error("Usuário sem permissão para gerenciar unidades.");
  }

  return user;
}

export async function createMunicipalUnit(formData: FormData) {
  const supabase = await createClient();

  await ensureCoordinationPermission();

  const name = normalizeText(formData.get("name"));
  const department = normalizeText(formData.get("department"));
  const responsibleName = normalizeText(formData.get("responsible_name"));
  const email = normalizeText(formData.get("email"));
  const phone = normalizeText(formData.get("phone"));
  const address = normalizeText(formData.get("address"));

  if (!name) {
    throw new Error("Informe o nome da unidade municipal.");
  }

  const { error } = await supabase.from("municipal_units").insert({
    name,
    department,
    responsible_name: responsibleName,
    email,
    phone,
    address,
    is_active: true,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar a unidade: ${error.message}`);
  }

  revalidatePath("/coordenadoria/unidades");
}

export async function toggleMunicipalUnitStatus(formData: FormData) {
  const supabase = await createClient();

  await ensureCoordinationPermission();

  const id = normalizeText(formData.get("id"));
  const currentValue = formData.get("is_active") === "true";

  if (!id) {
    throw new Error("Unidade não identificada.");
  }

  const { error } = await supabase
    .from("municipal_units")
    .update({
      is_active: !currentValue,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a unidade: ${error.message}`);
  }

  revalidatePath("/coordenadoria/unidades");
}

export async function releaseMunicipalUnitAccess(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  await ensureCoordinationPermission();

  const unitId = normalizeText(formData.get("unit_id"));
  const fullName = normalizeText(formData.get("full_name"));
  const email = normalizeText(formData.get("email"))?.toLowerCase();
  const password = normalizeText(formData.get("password"));

  if (!unitId) {
    throw new Error("Unidade não identificada.");
  }

  if (!fullName) {
    throw new Error("Informe o nome do responsável pelo acesso.");
  }

  if (!email) {
    throw new Error("Informe o e-mail de acesso da unidade.");
  }

  if (!password || password.length < 8) {
    throw new Error("Informe uma senha provisória com pelo menos 8 caracteres.");
  }

  const { data: unit, error: unitError } = await supabase
    .from("municipal_units")
    .select("id, name, is_active")
    .eq("id", unitId)
    .single();

  if (unitError || !unit) {
    throw new Error("Unidade municipal não encontrada.");
  }

  if (!unit.is_active) {
    throw new Error("A unidade precisa estar ativa para liberar acesso.");
  }

  const { data: createdUser, error: createUserError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        municipal_unit_id: unit.id,
        municipal_unit_name: unit.name,
        source: "municipal_unit_access",
      },
    });

  if (createUserError || !createdUser.user) {
    throw new Error(
      `Não foi possível criar o usuário da unidade: ${createUserError?.message}`,
    );
  }

  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: createdUser.user.id,
    full_name: fullName,
    email,
    role: "unidade",
    institution_id: null,
    municipal_unit_id: unit.id,
    is_active: true,
  });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(createdUser.user.id);

    throw new Error(
      `Usuário Auth criado, mas não foi possível criar o profile. O usuário foi removido. Detalhe: ${profileError.message}`,
    );
  }

  revalidatePath("/coordenadoria/unidades");
  redirect("/coordenadoria/unidades?acesso=1");
}
