import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInquiriesData } from "@/lib/queries/unit-inquiries";
import { respondUnitInquiry } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UnidadeSondagensPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
  }>;
};

function responseStatusLabel(status: string) {
  const labels: Record<string, string> = {
    campo_disponivel: "Campo disponível",
    campo_com_limite: "Campo com limite",
    sem_disponibilidade: "Sem disponibilidade",
    precisa_analise: "Precisa de análise",
  };

  return labels[status] ?? status;
}

function responseStatusClass(status: string) {
  if (status === "campo_disponivel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "campo_com_limite" || status === "precisa_analise") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "sem_disponibilidade") {
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

export default async function UnidadeSondagensPage({
  searchParams,
}: UnidadeSondagensPageProps) {
  const params = await searchParams;
  const { unitName, responses, error } = await getUnitInquiriesData();

  const pendingCount = responses.filter(
    (item) => item.response_status === "precisa_analise",
  ).length;
  const acceptedCount = responses.filter((item) =>
    ["campo_disponivel", "campo_com_limite"].includes(item.response_status),
  ).length;
  const unavailableCount = responses.filter(
    (item) => item.response_status === "sem_disponibilidade",
  ).length;

  const summaries = [
    {
      label: "Recebidas",
      value: String(responses.length),
      description: "Sondagens encaminhadas pela Coordenadoria.",
    },
    {
      label: "Pendentes",
      value: String(pendingCount),
      description: "Sondagens aguardando manifestação da unidade.",
    },
    {
      label: "Aceitas",
      value: String(acceptedCount),
      description: "Sondagens com possibilidade de campo.",
    },
    {
      label: "Sem disponibilidade",
      value: String(unavailableCount),
      description: "Sondagens recusadas por ausência de campo.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Responder Sondagens"
      description={
        unitName
          ? `Manifeste a disponibilidade da unidade ${unitName} para receber estudantes.`
          : "Analise consultas encaminhadas pela Coordenadoria e informe se há campo disponível."
      }
    >
      <div className="mb-6">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Resposta da unidade salva com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
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
            Sondagens encaminhadas
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Informe se a unidade possui condições de receber estudantes para o
            estágio curricular supervisionado, indicando quantidade possível,
            horários, supervisor e atividades compatíveis.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {responses.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhuma sondagem encaminhada.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  As sondagens encaminhadas pela Coordenadoria para esta unidade
                  aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {responses.map((response) => (
                <article key={response.id} className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {response.course_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${responseStatusClass(
                            response.response_status,
                          )}`}
                        >
                          {responseStatusLabel(response.response_status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {response.institution_name}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        <strong>Área/setor de interesse:</strong>{" "}
                        {response.requested_area ?? "Não informado"}
                      </p>
                    </div>

                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-3 xl:min-w-[520px]">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Solicitados
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {formatNumber(response.requested_students)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Carga horária
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {response.required_workload !== null
                            ? `${response.required_workload}h`
                            : "Não informada"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Período
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {response.intended_period ?? "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {response.inquiry_notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Observações da instituição
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {response.inquiry_notes}
                      </p>
                    </div>
                  )}

                  <form
                    action={respondUnitInquiry}
                    className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2"
                  >
                    <input type="hidden" name="response_id" value={response.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Manifestação da unidade
                      </span>
                      <select
                        name="response_status"
                        required
                        defaultValue={response.response_status}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                      >
                        <option value="precisa_analise">Precisa de análise</option>
                        <option value="campo_disponivel">Campo disponível</option>
                        <option value="campo_com_limite">Campo com limite</option>
                        <option value="sem_disponibilidade">
                          Sem disponibilidade
                        </option>
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Quantidade possível
                      </span>
                      <input
                        name="available_slots"
                        type="number"
                        min="0"
                        defaultValue={response.available_slots ?? ""}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        placeholder="Ex.: 2"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Horário possível
                      </span>
                      <input
                        name="possible_schedule"
                        defaultValue={response.possible_schedule ?? ""}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        placeholder="Ex.: matutino, vespertino, a combinar"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Supervisor
                      </span>
                      <input
                        name="supervisor_name"
                        defaultValue={response.supervisor_name ?? ""}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        placeholder="Nome do servidor responsável"
                      />
                    </label>

                    <label className="grid gap-2 lg:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Atividades compatíveis
                      </span>
                      <textarea
                        name="compatible_activities"
                        rows={3}
                        defaultValue={response.compatible_activities ?? ""}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        placeholder="Descreva as atividades que podem ser desempenhadas pelo estudante."
                      />
                    </label>

                    <label className="grid gap-2 lg:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Observações da unidade
                      </span>
                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={response.notes ?? ""}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        placeholder="Informe condições, limites ou justificativas."
                      />
                    </label>

                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                      >
                        Salvar resposta
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SystemShell>
  );
}
