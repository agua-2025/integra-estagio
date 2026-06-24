import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationInquiriesData } from "@/lib/queries/coordination-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    encaminhada?: string;
    concluida?: string;
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
  if (status === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "parcialmente_viavel") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "inviavel") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "encaminhada_unidade" || status === "em_analise") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function decisionLabel(decision: string | null) {
  const labels: Record<string, string> = {
    viavel: "Viável",
    parcialmente_viavel: "Parcial",
    inviavel: "Inviável",
    precisa_complementacao: "Complementar",
  };

  if (!decision) {
    return "Pendente";
  }

  return labels[decision] ?? decision;
}

function decisionClass(decision: string | null) {
  if (decision === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (decision === "parcialmente_viavel") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (decision === "inviavel") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (decision === "precisa_complementacao") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
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
  const { inquiries, error } = await getCoordinationInquiriesData();

  const total = inquiries.length;

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

  const concluidas = inquiries.filter((item) =>
    Boolean(item.coordination_decision),
  ).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Sondagens de estágio"
      description="Controle as sondagens recebidas, acompanhe os retornos das unidades e acesse a análise individual."
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

      {params?.encaminhada === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Sondagem encaminhada com sucesso.
        </section>
      )}

      {params?.concluida === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Conclusão registrada com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Atenção: {error}
        </section>
      )}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Total
            </p>
            <p className="text-xl font-black text-slate-950">{total}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Respondidas
            </p>
            <p className="text-xl font-black text-teal-800">{respondidas}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Aguardando
            </p>
            <p className="text-xl font-black text-amber-800">{aguardando}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Concluídas
            </p>
            <p className="text-xl font-black text-slate-950">{concluidas}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
            Lista de sondagens
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Clique em Analisar para abrir a página própria da sondagem.
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhuma sondagem encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead className="bg-slate-100 uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[220px] px-3 py-2 font-black">Sondagem</th>
                  <th className="w-[190px] px-3 py-2 font-black">
                    Área/Setor
                  </th>
                  <th className="w-[70px] px-3 py-2 text-center font-black">
                    Qtd.
                  </th>
                  <th className="w-[110px] px-3 py-2 font-black">Status</th>
                  <th className="w-[160px] px-3 py-2 font-black">
                    Retornos
                  </th>
                  <th className="w-[130px] px-3 py-2 font-black">
                    Conclusão
                  </th>
                  <th className="w-[95px] px-3 py-2 text-right font-black">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => {
                  const answeredCount = inquiry.unit_responses.filter(
                    (response) => response.response_status !== "precisa_analise",
                  ).length;

                  const waitingCount = inquiry.unit_responses.filter(
                    (response) => response.response_status === "precisa_analise",
                  ).length;

                  return (
                    <tr key={inquiry.id} className="align-top hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <p className="font-bold leading-5 text-slate-950">
                          {inquiry.institution_name}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {inquiry.course_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(inquiry.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </td>

                      <td className="px-3 py-2">
                        <p className="leading-5 text-slate-700">
                          {shortText(inquiry.requested_area)}
                        </p>
                      </td>

                      <td className="px-3 py-2 text-center font-bold text-slate-800">
                        {formatNumber(inquiry.requested_students)}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                            inquiry.status,
                          )}`}
                        >
                          {statusLabel(inquiry.status)}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <div className="grid gap-0.5 font-semibold leading-5">
                          <span className="text-slate-700">
                            {inquiry.unit_responses.length} consultada(s)
                          </span>
                          <span className="text-teal-700">
                            {answeredCount} respondida(s)
                          </span>
                          {waitingCount > 0 && (
                            <span className="text-amber-700">
                              {waitingCount} aguardando
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${decisionClass(
                            inquiry.coordination_decision,
                          )}`}
                        >
                          {decisionLabel(inquiry.coordination_decision)}
                        </span>

                        {inquiry.coordination_approved_students !== null && (
                          <p className="mt-1 text-[11px] font-bold text-slate-600">
                            {inquiry.coordination_approved_students} autorizado(s)
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/coordenadoria/sondagens/${inquiry.id}/analise`}
                          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Analisar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SystemShell>
  );
}
