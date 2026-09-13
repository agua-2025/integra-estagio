import { SystemShell } from "@/components/system/SystemShell";
import { getStudentAreaData } from "@/lib/queries/student-area";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    apresentado: "Apresentação enviada",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Pronto para autorização",
    autorizado: "Autorizado",
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
    concluido: "Concluído",
    concluido_com_observacao: "Concluído com observação",
    encerrado_antecipadamente: "Encerrado antecipadamente",
  };

  if (!status) return "Sem registro";
  return labels[status] ?? status;
}

function statusClass(status: string | null | undefined, workloadIncomplete = false) {
  if (workloadIncomplete) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (
    status &&
    [
      "autorizado",
      "aguardando_inicio",
      "em_andamento",
      "encerrado",
      "documentos_validados",
      "apto_para_autorizacao",
      "concluido",
      "concluido_com_observacao",
    ].includes(status)
  ) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (
    status &&
    [
      "apresentado",
      "em_analise",
      "pendente_correcao",
      "aguardando_unidade",
      "aguardando_supervisor",
    ].includes(status)
  ) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status && ["indeferido", "cancelado", "suspenso"].includes(status)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR").format(value);
}

function progressStep(status: string | null | undefined, workloadIncomplete: boolean) {
  if (workloadIncomplete) return 4;
  if (!status) return 0;

  if (["apresentado", "em_analise", "pendente_correcao"].includes(status)) return 1;
  if (["documentos_validados", "apto_para_autorizacao"].includes(status)) return 2;
  if (["autorizado", "aguardando_inicio"].includes(status)) return 3;
  if (status === "em_andamento") return 4;
  if (status === "encerrado") return 5;

  return 0;
}

function nextStepText({
  status,
  workloadIncomplete,
  completedWorkload,
  requiredWorkload,
}: {
  status: string | null | undefined;
  workloadIncomplete: boolean;
  completedWorkload: number | null;
  requiredWorkload: number | null;
}) {
  if (workloadIncomplete) {
    return `Consta carga cumprida de ${formatNumber(completedWorkload)}h de ${formatNumber(
      requiredWorkload,
    )}h. O encerramento regular depende da conferência da carga horária total.`;
  }

  if (!status) return "Aguardar o registro da apresentação pela instituição.";
  if (["apresentado", "em_analise"].includes(status)) return "Aguardar a análise da Coordenadoria.";
  if (status === "pendente_correcao") return "Aguardar a complementação documental pela instituição.";
  if (["documentos_validados", "apto_para_autorizacao"].includes(status)) return "Aguardar a autorização de início.";
  if (["autorizado", "aguardando_inicio"].includes(status)) return "Observar a data autorizada antes de iniciar.";
  if (status === "em_andamento") return "Cumprir as atividades conforme orientação da unidade e do supervisor.";
  if (status === "encerrado") return "Estágio encerrado. Consulte os documentos e o relatório final no menu lateral.";

  return "Acompanhar as próximas atualizações.";
}

export default async function EstagiarioAreaPage() {
  const {
    student,
    presentation,
    authorization,
    internship,
    documents,
    finalReport,
    institution,
    course,
    unit,
    error,
  } = await getStudentAreaData();

  const rawStatus =
    internship?.status ??
    authorization?.status ??
    presentation?.status ??
    null;

  const completedWorkload = finalReport?.completed_workload ?? null;
  const requiredWorkload = presentation?.required_workload ?? null;

  const workloadProgress =
    completedWorkload !== null && requiredWorkload && requiredWorkload > 0
      ? Math.min(100, Math.round((completedWorkload / requiredWorkload) * 100))
      : 0;

  const workloadIncomplete =
    Boolean(finalReport) &&
    completedWorkload !== null &&
    requiredWorkload !== null &&
    completedWorkload < requiredWorkload;

  const currentStatus = workloadIncomplete ? "Carga pendente" : statusLabel(rawStatus);
  const step = progressStep(rawStatus, workloadIncomplete);

  const sentDocuments = documents.filter((item) =>
    ["enviado", "validado"].includes(item.status),
  ).length;

  const validDocuments = documents.filter((item) => item.status === "validado").length;

  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Painel do estagiário"
      description="Acompanhe sua situação, carga horária, documentos e orientações principais."
    >
      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-br from-teal-50 via-white to-white px-5 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Bem-vindo
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Olá, {student?.full_name ?? "Estagiário"}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Este painel mostra sua evolução geral. Os detalhes do estágio,
                documentos e orientações ficam disponíveis no menu lateral.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                rawStatus,
                workloadIncomplete,
              )}`}
            >
              {currentStatus}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryCard
              label="Início autorizado"
              value={authorization ? formatDate(authorization.authorized_start_date) : "Aguardar"}
              description="Data definida pela Coordenadoria."
            />

            <SummaryCard
              label="Documentos"
              value={`${sentDocuments}/${documents.length || 0}`}
              description={`${validDocuments} documento(s) validado(s).`}
            />

            <SummaryCard
              label="Situação"
              value={currentStatus}
              description="Etapa atual do processo."
            />
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Evolução da carga horária
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    A conclusão regular depende do cumprimento da carga horária prevista.
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  {formatNumber(completedWorkload)}h de {formatNumber(requiredWorkload)}h
                </p>
              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                <div
                  className={`h-full rounded-full ${
                    workloadIncomplete ? "bg-amber-500" : "bg-teal-600"
                  }`}
                  style={{ width: `${workloadProgress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{workloadProgress}% registrado</span>
                <span>{workloadProgress >= 100 ? "Carga cumprida" : "Carga pendente"}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Etapas do estágio
                </h3>

                <p className="text-xs text-slate-500">Etapa {step} de 5</p>
              </div>

              <ProgressLine currentStep={step} workloadIncomplete={workloadIncomplete} />
            </div>

            <div
              className={`mt-4 rounded-2xl border p-5 ${
                workloadIncomplete
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-teal-100 bg-teal-50 text-teal-900"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Próximo passo
              </p>
              <p className="mt-1 text-sm leading-6">
                {nextStepText({
                  status: rawStatus,
                  workloadIncomplete,
                  completedWorkload,
                  requiredWorkload,
                })}
              </p>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-50 p-5 xl:border-l xl:border-t-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Meu vínculo
              </h3>

              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                <InfoLine label="Instituição" value={institution?.name ?? "-"} />
                <InfoLine label="Curso" value={course?.name ?? "-"} />
                <InfoLine label="Unidade" value={unit?.name ?? "Ainda não definida"} />
                <InfoLine
                  label="Supervisor"
                  value={
                    internship?.supervisor_name ??
                    authorization?.supervisor_name ??
                    "A definir"
                  }
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Orientação
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use o menu lateral para consultar o estágio, documentos e orientações.
                Esta tela resume apenas o andamento principal.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SystemShell>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ProgressLine({
  currentStep,
  workloadIncomplete,
}: {
  currentStep: number;
  workloadIncomplete: boolean;
}) {
  const steps = ["Apresentação", "Análise", "Autorização", "Início", "Encerramento"];

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber <= currentStep;
        const warning = workloadIncomplete && stepNumber === 5;

        return (
          <div key={step} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1 ${
                warning
                  ? "bg-amber-500 text-white ring-amber-500"
                  : active
                    ? "bg-teal-600 text-white ring-teal-600"
                    : "bg-slate-50 text-slate-500 ring-slate-200"
              }`}
            >
              {stepNumber}
            </div>

            <p
              className={`mt-2 text-xs ${
                active ? "font-medium text-slate-900" : "text-slate-500"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-slate-800">{label}:</span> {value}
    </p>
  );
}
