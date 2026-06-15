import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationInquiriesData } from "@/lib/queries/coordination-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    recebida: "Recebida",
    em_analise: "Em análise",
    encaminhada: "Encaminhada",
    viavel: "Viável",
    viavel_parcial: "Viável parcialmente",
    inviavel: "Sem campo disponível",
    pendente: "Pendente",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "viavel_parcial" || status === "em_analise" || status === "encaminhada") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "inviavel") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return String(value);
}

export default async function SondagensPage() {
  const { inquiries, error } = await getCoordinationInquiriesData();

  const receivedCount = inquiries.filter((item) => item.status === "recebida").length;
  const inAnalysisCount = inquiries.filter((item) =>
    ["em_analise", "encaminhada", "pendente"].includes(item.status),
  ).length;
  const viableCount = inquiries.filter((item) =>
    ["viavel", "viavel_parcial"].includes(item.status),
  ).length;
  const unavailableCount = inquiries.filter((item) => item.status === "inviavel").length;

  const summaries = [
    {
      label: "Recebidas",
      value: String(receivedCount),
      description: "Sondagens aguardando análise inicial.",
    },
    {
      label: "Em análise",
      value: String(inAnalysisCount),
      description: "Sondagens em análise ou encaminhadas.",
    },
    {
      label: "Viáveis",
      value: String(viableCount),
      description: "Sondagens com possibilidade de campo.",
    },
    {
      label: "Sem campo",
      value: String(unavailableCount),
      description: "Sondagens sem disponibilidade no momento.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Sondagens de Campo de Estágio"
      description="Visualize as sondagens enviadas pelas instituições de ensino e acompanhe a etapa de análise."
    >
      <div className="mb-6">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>
      </div>

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as sondagens: {error}
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Sondagens recebidas
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Lista real das consultas enviadas pelas instituições. O encaminhamento
            às unidades municipais será implementado na próxima etapa.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {inquiries.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhuma sondagem recebida.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  As sondagens enviadas pelas instituições aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map((inquiry) => (
                <article key={inquiry.id} className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {inquiry.course_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            inquiry.status,
                          )}`}
                        >
                          {statusLabel(inquiry.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {inquiry.institution_name}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        <strong>Área pretendida:</strong>{" "}
                        {inquiry.requested_area ?? "Não informada"}
                      </p>
                    </div>

                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3 xl:min-w-[520px]">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Estudantes
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {formatNumber(inquiry.requested_students)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Carga horária
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {inquiry.required_workload !== null
                            ? `${inquiry.required_workload}h`
                            : "Não informada"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Período
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {inquiry.intended_period ?? "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {inquiry.notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Observações da instituição
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {inquiry.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                    >
                      Ver detalhes
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                    >
                      Encaminhar unidade
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                    >
                      Responder
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SystemShell>
  );
}
