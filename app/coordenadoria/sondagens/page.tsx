import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { forwardInquiryToUnit } from "./actions";
import { getCoordinationInquiriesData } from "@/lib/queries/coordination-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    encaminhada?: string;
  }>;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    recebida: "Recebida",
    em_analise: "Em análise",
    encaminhada_unidade: "Encaminhada",
    viavel: "Viável",
    parcialmente_viavel: "Parcial",
    inviavel: "Inviável",
    concluida: "Concluída",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "recebida") {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  if (status === "encaminhada_unidade" || status === "em_analise") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "parcialmente_viavel") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "inviavel") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function unitResponseLabel(status: string) {
  const labels: Record<string, string> = {
    campo_disponivel: "Disponível",
    campo_com_limite: "Com limite",
    sem_disponibilidade: "Sem vaga",
    precisa_analise: "Aguardando",
  };

  return labels[status] ?? status;
}

function unitResponseClass(status: string) {
  if (status === "campo_disponivel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "campo_com_limite") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "sem_disponibilidade") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function shortText(value: string | null, fallback = "-") {
  if (!value) {
    return fallback;
  }

  return value;
}

export default async function CoordenadoriaSondagensPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { inquiries, units, error } = await getCoordinationInquiriesData();

  const total = inquiries.length;
  const encaminhadas = inquiries.filter(
    (item) => item.status === "encaminhada_unidade",
  ).length;
  const respondidas = inquiries.filter((item) =>
    item.unit_responses.some(
      (response) => response.response_status !== "precisa_analise",
    ),
  ).length;
  const aguardando = inquiries.filter((item) =>
    item.unit_responses.some(
      (response) => response.response_status === "precisa_analise",
    ),
  ).length;

  const summaries = [
    {
      label: "Total",
      value: String(total),
      description: "Sondagens recebidas.",
    },
    {
      label: "Encaminhadas",
      value: String(encaminhadas),
      description: "Enviadas para unidades.",
    },
    {
      label: "Respondidas",
      value: String(respondidas),
      description: "Com manifestação da unidade.",
    },
    {
      label: "Aguardando",
      value: String(aguardando),
      description: "Pendentes de resposta.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Sondagens de estágio"
      description="Acompanhe as solicitações das instituições, encaminhe para as unidades municipais e visualize as respostas de forma compacta."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/unidades"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver unidades municipais
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      {params?.encaminhada === "1" && (
        <section className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Sondagem encaminhada com sucesso.
        </section>
      )}

      {error && (
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Atenção: {error}
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
            Lista de sondagens
          </h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhuma sondagem encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[220px] px-4 py-3 font-black">
                    Instituição
                  </th>
                  <th className="w-[180px] px-4 py-3 font-black">Curso</th>
                  <th className="w-[170px] px-4 py-3 font-black">
                    Área/Setor
                  </th>
                  <th className="w-[80px] px-4 py-3 text-center font-black">
                    Qtd.
                  </th>
                  <th className="w-[140px] px-4 py-3 font-black">Período</th>
                  <th className="w-[130px] px-4 py-3 font-black">Status</th>
                  <th className="w-[310px] px-4 py-3 font-black">
                    Respostas das unidades
                  </th>
                  <th className="w-[260px] px-4 py-3 font-black">
                    Encaminhar
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="align-top transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold leading-5 text-slate-950">
                        {inquiry.institution_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(inquiry.created_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="leading-5 text-slate-700">
                        {inquiry.course_name}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="leading-5 text-slate-700">
                        {shortText(inquiry.requested_area)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {formatNumber(inquiry.requested_students)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="leading-5 text-slate-700">
                        {shortText(inquiry.intended_period)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                          inquiry.status,
                        )}`}
                      >
                        {statusLabel(inquiry.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {inquiry.unit_responses.length === 0 ? (
                        <span className="text-xs font-semibold text-slate-400">
                          Nenhuma unidade consultada
                        </span>
                      ) : (
                        <div className="grid gap-1.5">
                          {inquiry.unit_responses.map((response) => (
                            <details
                              key={response.id}
                              className="group rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                            >
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                                <span className="truncate text-xs font-bold text-slate-800">
                                  {response.unit_name}
                                </span>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${unitResponseClass(
                                    response.response_status,
                                  )}`}
                                >
                                  {unitResponseLabel(response.response_status)}
                                  {response.available_slots !== null
                                    ? ` · ${response.available_slots} vaga(s)`
                                    : ""}
                                </span>
                              </summary>

                              <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs leading-5 text-slate-600">
                                <p>
                                  <strong>Horário:</strong>{" "}
                                  {response.possible_schedule ??
                                    "Não informado"}
                                </p>

                                <p>
                                  <strong>Supervisor:</strong>{" "}
                                  {response.supervisor_name ?? "Não informado"}
                                </p>

                                {response.compatible_activities && (
                                  <p>
                                    <strong>Atividades:</strong>{" "}
                                    {response.compatible_activities}
                                  </p>
                                )}

                                {response.notes && (
                                  <p>
                                    <strong>Obs.:</strong> {response.notes}
                                  </p>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <form
                        action={forwardInquiryToUnit}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="inquiry_id"
                          value={inquiry.id}
                        />

                        <select
                          name="municipal_unit_id"
                          required
                          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Unidade
                          </option>

                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          className="h-9 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white transition hover:bg-teal-800"
                        >
                          Enviar
                        </button>
                      </form>

                      {inquiry.notes && (
                        <details className="mt-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600">
                          <summary className="cursor-pointer font-bold text-slate-700">
                            Observações
                          </summary>
                          <p className="mt-2 leading-5">{inquiry.notes}</p>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SystemShell>
  );
}
