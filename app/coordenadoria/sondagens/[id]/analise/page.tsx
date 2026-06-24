import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { finalizeCoordinationInquiry, forwardInquiryToUnit } from "../../actions";
import { getCoordinationInquiriesData } from "@/lib/queries/coordination-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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

function unitResponseLabel(status: string) {
  const labels: Record<string, string> = {
    campo_disponivel: "Disponível",
    campo_com_limite: "Limite",
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

export default async function AnaliseSondagemPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { inquiries, units, error } = await getCoordinationInquiriesData();

  const inquiry = inquiries.find((item) => item.id === id);

  if (!inquiry) {
    notFound();
  }

  const pendingResponses = inquiry.unit_responses.filter(
    (response) => response.response_status === "precisa_analise",
  ).length;

  const canFinalize =
    inquiry.unit_responses.length > 0 && pendingResponses === 0;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Análise da sondagem"
      description="Analise a solicitação, consulte unidades municipais e registre a conclusão da Coordenadoria."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/sondagens"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para lista de sondagens
        </Link>

        <Link
          href="/coordenadoria/unidades"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Unidades municipais
        </Link>
      </div>

      {query?.encaminhada === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
          Sondagem encaminhada com sucesso.
        </section>
      )}

      {query?.concluida === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
          Conclusão registrada com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          Atenção: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-teal-700">
                Dados da solicitação
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                {inquiry.course_name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {inquiry.institution_name}
              </p>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="font-bold uppercase text-slate-500">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                    inquiry.status,
                  )}`}
                >
                  {statusLabel(inquiry.status)}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="font-bold uppercase text-slate-500">Conclusão</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${decisionClass(
                    inquiry.coordination_decision,
                  )}`}
                >
                  {decisionLabel(inquiry.coordination_decision)}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="font-bold uppercase text-slate-500">Solicitados</p>
                <p className="mt-1 font-black text-slate-900">
                  {formatNumber(inquiry.requested_students)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="font-bold uppercase text-slate-500">Período</p>
                <p className="mt-1 font-black text-slate-900">
                  {shortText(inquiry.intended_period)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase text-slate-500">
                Área/setor de interesse
              </p>
              <p className="mt-1 text-slate-700">
                {shortText(inquiry.requested_area)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-[11px] font-bold uppercase text-slate-500">
                Observações da instituição
              </p>
              <p className="mt-1 text-slate-700">{shortText(inquiry.notes)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-4">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Respostas das unidades
              </h3>

              {inquiry.unit_responses.length === 0 ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  Nenhuma unidade foi consultada.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                    <thead className="bg-slate-100 uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-3 py-2 font-black">Unidade</th>
                        <th className="px-3 py-2 font-black">Resposta</th>
                        <th className="px-3 py-2 text-center font-black">
                          Vagas
                        </th>
                        <th className="px-3 py-2 font-black">Supervisor</th>
                        <th className="px-3 py-2 font-black">Horário</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {inquiry.unit_responses.map((response) => (
                        <tr key={response.id}>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {response.unit_name}
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${unitResponseClass(
                                response.response_status,
                              )}`}
                            >
                              {unitResponseLabel(response.response_status)}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-center font-bold text-slate-800">
                            {formatNumber(response.available_slots)}
                          </td>

                          <td className="px-3 py-2 text-slate-700">
                            {shortText(response.supervisor_name)}
                          </td>

                          <td className="px-3 py-2 text-slate-700">
                            {shortText(response.possible_schedule)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Conclusão da Coordenadoria
              </h3>

              {!canFinalize && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
                  {inquiry.unit_responses.length === 0
                    ? "Consulte ao menos uma unidade municipal antes de registrar a conclusão."
                    : `Ainda há ${pendingResponses} unidade(s) aguardando resposta.`}
                </div>
              )}

              <form action={finalizeCoordinationInquiry} className="mt-3 grid gap-3">
                <input type="hidden" name="inquiry_id" value={inquiry.id} />

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                    Resultado da análise
                    <select
                      name="coordination_decision"
                      required
                      disabled={!canFinalize}
                      defaultValue={inquiry.coordination_decision ?? ""}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option value="viavel">Viável</option>
                      <option value="parcialmente_viavel">
                        Parcialmente viável
                      </option>
                      <option value="inviavel">Inviável</option>
                      <option value="precisa_complementacao">
                        Precisa de complementação
                      </option>
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                    Quantidade autorizada
                    <input
                      name="coordination_approved_students"
                      type="number"
                      min="0"
                      max={inquiry.requested_students ?? undefined}
                      disabled={!canFinalize}
                      defaultValue={
                        inquiry.coordination_approved_students ??
                        inquiry.requested_students ??
                        ""
                      }
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      placeholder="Ex.: 10"
                    />
                  </label>
                </div>

                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  Observações da Coordenadoria
                  <textarea
                    name="coordination_notes"
                    disabled={!canFinalize}
                    defaultValue={inquiry.coordination_notes ?? ""}
                    rows={3}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="Registre a análise, justificativa, condições ou pendências."
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/coordenadoria/sondagens"
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Voltar para lista
                  </Link>

                  <button
                    type="submit"
                    disabled={!canFinalize}
                    className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {canFinalize ? "Salvar conclusão" : "Aguardando respostas"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
              Encaminhar para unidade
            </h3>

            <form action={forwardInquiryToUnit} className="mt-3 grid gap-3">
              <input type="hidden" name="inquiry_id" value={inquiry.id} />

              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Unidade municipal
                <select
                  name="municipal_unit_id"
                  required
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione uma unidade
                  </option>

                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                Encaminhar sondagem
              </button>
            </form>
          </aside>
        </div>
      </section>
    </SystemShell>
  );
}
