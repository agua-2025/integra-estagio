"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

const allowedInstitutionStatus = [
  "em_analise",
  "ativa",
  "pendente",
  "inativa",
  "bloqueada",
];

function validateRequiredInstitutionField(value: unknown, message: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }
}

async function ensureInstitutionReadyToActivate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  institutionId: string,
) {
  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select(
      "id, name, legal_name, cnpj, email, phone, address_line, address_number, neighborhood, city, state, zip_code, legal_representative_name, legal_representative_role, legal_representative_cpf, legal_representative_rg, legal_representative_rg_issuer, legal_representative_email, legal_representative_phone, internship_sector_contact_name, internship_sector_contact_email, internship_sector_contact_phone",
    )
    .eq("id", institutionId)
    .single();

  if (institutionError || !institution) {
    throw new Error(
      institutionError?.message ?? "Instituição não encontrada para validação.",
    );
  }

  validateRequiredInstitutionField(institution.name, "Informe o nome da instituição.");
  validateRequiredInstitutionField(institution.legal_name, "Informe a razão social da instituição.");
  validateRequiredInstitutionField(institution.cnpj, "Informe o CNPJ da instituição.");
  validateRequiredInstitutionField(institution.email, "Informe o e-mail institucional.");
  validateRequiredInstitutionField(institution.phone, "Informe o telefone institucional.");
  validateRequiredInstitutionField(institution.address_line, "Informe o endereço da instituição.");
  validateRequiredInstitutionField(institution.address_number, "Informe o número do endereço da instituição.");
  validateRequiredInstitutionField(institution.neighborhood, "Informe o bairro da instituição.");
  validateRequiredInstitutionField(institution.city, "Informe a cidade da instituição.");
  validateRequiredInstitutionField(institution.state, "Informe a UF da instituição.");
  validateRequiredInstitutionField(institution.zip_code, "Informe o CEP da instituição.");
  validateRequiredInstitutionField(institution.legal_representative_name, "Informe o representante legal da instituição.");
  validateRequiredInstitutionField(institution.legal_representative_role, "Informe o cargo do representante legal.");
  validateRequiredInstitutionField(institution.legal_representative_cpf, "Informe o CPF do representante legal.");
  validateRequiredInstitutionField(institution.legal_representative_email, "Informe o e-mail do representante legal.");
  validateRequiredInstitutionField(institution.legal_representative_phone, "Informe o telefone do representante legal.");
  validateRequiredInstitutionField(institution.internship_sector_contact_name, "Informe o responsável pelo setor de estágio.");
  validateRequiredInstitutionField(institution.internship_sector_contact_email, "Informe o e-mail do setor de estágio.");
  validateRequiredInstitutionField(institution.internship_sector_contact_phone, "Informe o telefone do setor de estágio.");

  const { count, error: coursesError } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("institution_id", institutionId)
    .eq("is_active", true);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  if (!count || count <= 0) {
    throw new Error("Para ativar a instituição, ela precisa possuir ao menos um curso ativo.");
  }
}

export async function updateInstitutionStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!id) {
    redirect("/coordenadoria/instituicoes-cursos?erro=Instituição não identificada.");
  }

  if (!allowedInstitutionStatus.includes(status)) {
    redirect("/coordenadoria/instituicoes-cursos?erro=Status inválido para a instituição.");
  }

  try {
    if (status === "ativa") {
      await ensureInstitutionReadyToActivate(supabase, id);
    }

    const { error } = await supabase
      .from("institutions")
      .update({ status })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível alterar a instituição.";

    const params = new URLSearchParams({
      erro: message,
    });

    redirect(`/coordenadoria/instituicoes-cursos?${params.toString()}`);
  }

  revalidatePath("/coordenadoria/instituicoes-cursos");
  redirect("/coordenadoria/instituicoes-cursos");
}

export async function toggleCourseStatus(formData: FormData) {
  const supabase = await createClient();

  const id = normalizeText(formData.get("id"));
  const currentValue = formData.get("is_active") === "true";

  if (!id) {
    throw new Error("Curso não identificado.");
  }

  const { error } = await supabase
    .from("courses")
    .update({ is_active: !currentValue })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar o curso: ${error.message}`);
  }

  revalidatePath("/coordenadoria/instituicoes-cursos");
  revalidatePath("/coordenadoria/instituicoes-cursos/cursos");
}
