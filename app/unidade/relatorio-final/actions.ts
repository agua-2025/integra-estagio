"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedClosingStatuses = [
  "concluido",
  "concluido_com_observacao",
  "encerrado_antecipadamente",
];

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function fail(message: string): never {
  redirect(`/unidade/relatorio-final?erro=${encodeURIComponent(message)}`);
}

async function ensureUnitPermission() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    fail("Usuário não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active, municipal_unit_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    fail(profileError?.message ?? "Perfil não encontrado.");
  }

  if (!profile.is_active || profile.role !== "unidade" || !profile.municipal_unit_id) {
    fail("Acesso permitido apenas à unidade municipal ativa.");
  }

  return {
    supabase,
    userId: user.id,
    municipalUnitId: profile.municipal_unit_id as string,
  };
}

export async function createUnitFinalReport(formData: FormData) {
  const { supabase, userId, municipalUnitId } = await ensureUnitPermission();

  const internshipId = normalizeText(formData.get("internship_id"));
  const performedPeriod = normalizeText(formData.get("performed_period"));
  const completedWorkload = normalizeNumber(formData.get("completed_workload"));
  const activitiesSummary = normalizeText(formData.get("activities_summary"));
  const supervisorNotes = normalizeText(formData.get("supervisor_notes"));
  const closingStatus = normalizeText(formData.get("closing_status"));

  if (!internshipId) {
    fail("Selecione o estagiário.");
  }

  if (!performedPeriod) {
    fail("Informe o período efetivamente realizado.");
  }

  if (!completedWorkload || completedWorkload <= 0) {
    fail("Informe a carga horária cumprida.");
  }

  if (!activitiesSummary) {
    fail("Informe o resumo das atividades desenvolvidas.");
  }

  if (!closingStatus || !allowedClosingStatuses.includes(closingStatus)) {
    fail("Selecione uma situação de encerramento válida.");
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select("id, student_id, municipal_unit_id, supervisor_name, status")
    .eq("id", internshipId)
    .single();

  if (internshipError || !internship) {
    fail(internshipError?.message ?? "Estágio não encontrado.");
  }

  if (internship.municipal_unit_id !== municipalUnitId) {
    fail("Este estágio não pertence à sua unidade.");
  }

  if (!["em_andamento", "suspenso"].includes(internship.status)) {
    fail("Somente estágios em andamento ou suspensos podem receber relatório final.");
  }

  const { data: existingReport, error: existingError } = await supabase
    .from("final_reports")
    .select("id")
    .eq("internship_id", internship.id)
    .maybeSingle();

  if (existingError) {
    fail(existingError.message);
  }

  if (existingReport) {
    fail("Já existe relatório final registrado para este estágio.");
  }

  const { error: insertError } = await supabase.from("final_reports").insert({
    internship_id: internship.id,
    student_id: internship.student_id,
    municipal_unit_id: internship.municipal_unit_id,
    supervisor_name: internship.supervisor_name,
    performed_period: performedPeriod,
    completed_workload: completedWorkload,
    activities_summary: activitiesSummary,
    supervisor_notes: supervisorNotes,
    closing_status: closingStatus,
    created_by: userId,
  });

  if (insertError) {
    fail(insertError.message);
  }

  const { error: updateInternshipError } = await supabase
    .from("internships")
    .update({
      status: "encerrado",
      updated_at: new Date().toISOString(),
    })
    .eq("id", internship.id);

  if (updateInternshipError) {
    fail(updateInternshipError.message);
  }

  revalidatePath("/unidade/relatorio-final");
  revalidatePath("/unidade/estagiarios");
  revalidatePath("/coordenadoria/ocorrencias");

  redirect("/unidade/relatorio-final?sucesso=1");
}
