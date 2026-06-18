import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { finalizeCoordinationInquiry, forwardInquiryToUnit } from "./actions";
import { getCoordinationInquiriesData } from "@/lib/queries/coordination-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    encaminhada?: string;
    concluida?: string;
    analisar?: string;
    concluir?: string;
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

function decisionLabel(decision: string | null) {
  const labels: Record<string, string> = {
    viavel: "Viável",
    parcialmente_viavel: "Parcialmente viável",
    inviavel: "Inviável",
    precisa_complementacao: "Precisa complementação",
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

  const selectedInquiryId = params?.analisar ?? params?.concluir ?? null;
  const selectedInquiry =
    inquiries.find((item) => item.id === selectedInquiryId) ?? null;

  const selectedPendingResponses =
    selectedInquiry?.unit_responses.filter(
      (response) => response.response_status === "precisa_analise",
    ).length ?? 0;

  const canFinalizeSelectedInquiry =
    selectedInquiry !== null &&
    selectedInquiry.unit_responses.length > 0 &&
    selectedPendingResponses === 0;

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

  const concluidas = inquiries.filter((item) =>
    Boolean(item.coordination_decision),
  ).length;

  const summaries = [
    {
      label: "Total",
      value: String(total),
      description: "Sondagens recebidas.",
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
    {
      label: "Concluídas",
      value: String(concluidas),
      description: "Com análise da Coordenadoria.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Sondagens de estágio"
      description="Analise as solicitações, consulte as unidades municipais e registre a conclusão da Coordenadoria."
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

      {params?.concluida === "1" && (
        <section className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Conclusão da Coordenadoria registrada com sucesso.
        </section>
      )}

      {error && (
        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Atenção: {error}
        </section>
      )}

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
              Lista de sondagens
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Clique em Analisar para abrir o painel completo da sondagem.
            </p>
          </div>

          {selectedInquiry && (
            <Link
              href="#painel-analise"
              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
            >
              Ir para análise selecionada
            </Link>
          )}
        </div>

        {inquiries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Nenhuma sondagem encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[220px] px-4 py-3 font-black">
                    Instituição
                  </th>
                  <th className="w-[180px] px-4 py-3 font-black">Curso</th>
                  <th className="w-[190px] px-4 py-3 font-black">
                    Área/Setor
                  </th>
                  <th className="w-[70px] px-4 py-3 text-center font-black">
                    Qtd.
                  </th>
                  <th className="w-[120px] px-4 py-3 font-black">Status</th>
                  <th className="w-[170px] px-4 py-3 font-black">
                    Respostas
                  </th>
                  <th className="w-[170px] px-4 py-3 font-black">
                    Conclusão
                  </th>
                  <th className="w-[120px] px-4 py-3 text-right font-black">
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
                  const isSelected = selectedInquiry?.id === inquiry.id;

                  return (
                    <tr
                      key={inquiry.id}
                      className={`align-top transition hover:bg-slate-50 ${
                        isSelected ? "bg-teal-50/40" : ""
                      }`}
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
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                            inquiry.status,
                          )}`}
                        >
                          {statusLabel(inquiry.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="grid gap-1 text-xs font-semibold">
                          <span className="text-slate-700">
                            {inquiry.unit_responses.length} unidade(s)
                            consultada(s)
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

                      <td className="px-4 py-3">
                        <div className="grid gap-1">
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${decisionClass(
                              inquiry.coordination_decision,
                            )}`}
                          >
                            {decisionLabel(inquiry.coordination_decision)}
                          </span>

                          {inquiry.coordination_decided_at && (
                            <p className="text-[11px] font-semibold text-slate-400">
                              {new Date(
                                inquiry.coordination_decided_at,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/coordenadoria/sondagens?analisar=${inquiry.id}#painel-analise`}
                          className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold transition ${
                            isSelected
                              ? "bg-teal-700 text-white hover:bg-teal-800"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-800"
                          }`}
                        >
                          {isSelected ? "Selecionada" : "Analisar"}
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

      {selectedInquiry && (
        <section
          id="painel-analise"
          className="mt-5 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm"
        >
          <div className="border-b border-teal-100 bg-teal-50 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-teal-800">
                  Painel de análise da sondagem
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  {selectedInquiry.course_name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedInquiry.institution_name}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[480px]">
                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Solicitados
                  </p>
                  <p className="font-black text-slate-900">
                    {formatNumber(selectedInquiry.requested_students)}
                  </p>
                </div>

                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Período
                  </p>
                  <p className="font-black text-slate-900">
                    {shortText(selectedInquiry.intended_period)}
                  </p>
                </div>

                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Conclusão
                  </p>
                  <p className="font-black text-slate-900">
                    {decisionLabel(selectedInquiry.coordination_decision)}
                  </p>
                  {selectedInquiry.coordination_approved_students !== null && (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {selectedInquiry.coordination_approved_students} autorizado(s)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
              <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                <p className="text-[11px] font-bold uppercase text-slate-500">
                  Área/setor de interesse
                </p>
                <p className="mt-1 text-slate-700">
                  {shortText(selectedInquiry.requested_area)}
                </p>
              </div>

              <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                <p className="text-[11px] font-bold uppercase text-slate-500">
                  Observações da instituição
                </p>
                <p className="mt-1 text-slate-700">
                  {shortText(selectedInquiry.notes)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                      Respostas das unidades
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Consulte as manifestações recebidas antes de concluir.
                    </p>
                  </div>
                </div>

                {selectedInquiry.unit_responses.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    Nenhuma unidade foi consultada para esta sondagem.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {selectedInquiry.unit_responses.map((response) => (
                      <details
                        key={response.id}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-bold text-slate-900">
                            {response.unit_name}
                          </span>

                          <span
                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${unitResponseClass(
                              response.response_status,
                            )}`}
                          >
                            {unitResponseLabel(response.response_status)}
                            {response.available_slots !== null
                              ? ` · ${response.available_slots} vaga(s)`
                              : ""}
                          </span>
                        </summary>

                        <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">
                          <p>
                            <strong>Horário:</strong>{" "}
                            {response.possible_schedule ?? "Não informado"}
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
                              <strong>Observações:</strong> {response.notes}
                            </p>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                  Conclusão da Coordenadoria
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Registre o resultado final da análise para conhecimento da instituição.
                </p>

                {!canFinalizeSelectedInquiry && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
                    {selectedInquiry.unit_responses.length === 0
                      ? "Consulte ao menos uma unidade municipal antes de registrar a conclusão."
                      : `Ainda há ${selectedPendingResponses} unidade(s) aguardando resposta. A conclusão será liberada após o retorno das unidades consultadas.`}
                  </div>
                )}

                <form
                  action={finalizeCoordinationInquiry}
                  className="mt-4 grid gap-4"
                >
                  <input
                    type="hidden"
                    name="inquiry_id"
                    value={selectedInquiry.id}
                  />

                  <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                    Resultado da análise
                    <select
                      name="coordination_decision"
                      required
                      disabled={!canFinalizeSelectedInquiry}
                      defaultValue={selectedInquiry.coordination_decision ?? ""}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="" disabled>
                        Selecione a conclusão
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

                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                      Quantidade viável/autorizada
                      <input
                        name="coordination_approved_students"
                        type="number"
                        min="0"
                        max={selectedInquiry.requested_students ?? undefined}
                        disabled={!canFinalizeSelectedInquiry}
                        defaultValue={
                          selectedInquiry.coordination_approved_students ??
                          selectedInquiry.requested_students ??
                          ""
                        }
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        placeholder="Ex.: 10"
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        Solicitado pela instituição: {formatNumber(selectedInquiry.requested_students)}
                      </span>
                    </label>
                  </div>

                  <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                    Observações da Coordenadoria
                    <textarea
                      name="coordination_notes"
                      disabled={!canFinalizeSelectedInquiry}
                      defaultValue={selectedInquiry.coordination_notes ?? ""}
                      rows={4}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      placeholder="Registre a análise, justificativa, condições ou pendências para conhecimento da instituição."
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href="/coordenadoria/sondagens"
                      className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Fechar painel de análise
                    </Link>

                    <button
                      type="submit"
                      disabled={!canFinalizeSelectedInquiry}
                      className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {canFinalizeSelectedInquiry
                        ? "Salvar conclusão"
                        : "Aguardando respostas"}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Encaminhar para unidade
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use este bloco para consultar novas unidades municipais sobre a
                mesma sondagem.
              </p>

              <form action={forwardInquiryToUnit} className="mt-4 grid gap-3">
                <input
                  type="hidden"
                  name="inquiry_id"
                  value={selectedInquiry.id}
                />

                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  Unidade municipal
                  <select
                    name="municipal_unit_id"
                    required
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                  className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Encaminhar sondagem
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Situação atual
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">Status</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                        selectedInquiry.status,
                      )}`}
                    >
                      {statusLabel(selectedInquiry.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-600">Conclusão</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${decisionClass(
                        selectedInquiry.coordination_decision,
                      )}`}
                    >
                      {decisionLabel(selectedInquiry.coordination_decision)}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </SystemShell>
  );
}



