"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function valueOf(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function fail(id: string, message: string): never {
  redirect(
    `/unidade/relatorio-final/${encodeURIComponent(id)}?erro=${encodeURIComponent(message)}`
  );
}

export async function createUnitFinalReport(formData: FormData) {
  const internshipId = valueOf(formData, "internship_id");
  const performedPeriod = valueOf(formData, "performed_period");
  const activitiesSummary = valueOf(formData, "activities_summary");
  const supervisorNotes = valueOf(formData, "supervisor_notes");
  const closingStatus = valueOf(formData, "closing_status");

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      internshipId
    )
  ) {
    redirect("/unidade/relatorio-final?erro=Identificador%20do%20estagio%20ausente%20ou%20invalido");
  }

  if (!performedPeriod || !activitiesSummary) {
    fail(internshipId, "Informe o período e as atividades desenvolvidas.");
  }

  if (
    ![
      "concluido",
      "concluido_com_observacao",
      "encerrado_antecipadamente",
    ].includes(closingStatus)
  ) {
    fail(internshipId, "Selecione uma situação válida.");
  }

  if (closingStatus === "encerrado_antecipadamente" && !supervisorNotes) {
    fail(internshipId, "Justifique o encerramento antecipado.");
  }

  const supabase = await createClient();

  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError || !auth.user) {
    fail(internshipId, "Usuário não autenticado.");
  }

  const { error } = await supabase.rpc(
    "close_internship_with_attendance",
    {
      p_internship_id: internshipId,
      p_performed_period: performedPeriod,
      p_activities_summary: activitiesSummary,
      p_supervisor_notes: supervisorNotes || null,
      p_closing_status: closingStatus,
    }
  );

  if (error) {
    fail(internshipId, error.message);
  }

  [
    "/unidade/relatorio-final",
    `/unidade/relatorio-final/${internshipId}`,
    "/unidade/estagiarios",
    `/unidade/estagiarios/${internshipId}`,
    "/unidade/frequencia",
    `/unidade/frequencia/${internshipId}`,
    "/coordenadoria/estagios",
    `/coordenadoria/estagios/${internshipId}`,
    "/coordenadoria/relatorios-finais",
    "/coordenadoria/ocorrencias",
    "/instituicao/estudantes",
    `/instituicao/estudantes/${internshipId}`,
    "/estagiario",
    "/estagiario/estagio",
    "/estagiario/documentos",
    "/estagiario/orientacoes",
  ].forEach((path) => revalidatePath(path));

  redirect("/unidade/relatorio-final?sucesso=1");
}

