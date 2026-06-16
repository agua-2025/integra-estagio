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
    responder?: string;
  }>;
};

function responseStatusLabel(status: string) {
  const labels: Record<string, string> = {
    campo_disponivel: "Disponível",
    campo_com_limite: "Com limite",
    sem_disponibilidade: "Sem disponibilidade",
    precisa_analise: "Aguardando análise",
  };

  return labels[status] ?? status;
}

function responseStatusClass(status: string) {
  if (status === "campo_disponivel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "campo_com_limite") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "sem_disponibilidade") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function formatWorkload(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value}h`;
}

function shortText(value: string | null, fallback = "-") {
  if (!value) {
    return fallback;
  }

  return value;
}

export default async function UnidadeSondagensPage({
  searchParams,
}: UnidadeSondagensPageProps) {
  const params = await searchParams;
  const { unitName, responses, error } = await getUnitInquiriesData();

  const selectedResponse =
    responses.find((item) => item.id === params?.responder) ??
    responses.find((item) => item.response_status === "precisa_analise") ??
    null;

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
      description: "Sondagens encaminhadas.",
    },
    {
      label: "Pendentes",
      value: String(pendingCount),
      description: "Aguardando manifestação.",
    },
    {
      label: "Aceitas",
      value: String(acceptedCount),
      description: "Com possibilidade de campo.",
    },
    {
      label: "Sem disponibilidade",
      value: String(unavailableCount),
      description: "Sem campo disponível.",
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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Resposta da unidade salva com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
              Sondagens encaminhadas
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Clique em responder para abrir o formulário em painel separado.
            </p>
          </div>

          {selectedResponse && (
            <Link
              href="#painel-resposta"
              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
            >
              Ir para resposta selecionada
            </Link>
          )}
        </div>

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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[220px] px-4 py-3 font-black">
                    Instituição
                  </th>
                  <th className="w-[180px] px-4 py-3 font-black">Curso</th>
                  <th className="w-[220px] px-4 py-3 font-black">
                    Área/Setor
                  </th>
                  <th className="w-[80px] px-4 py-3 text-center font-black">
                    Qtd.
                  </th>
                  <th className="w-[90px] px-4 py-3 text-center font-black">
                    Carga
                  </th>
                  <th className="w-[130px] px-4 py-3 font-black">Período</th>
                  <th className="w-[150px] px-4 py-3 font-black">Status</th>
                  <th className="w-[150px] px-4 py-3 text-right font-black">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {responses.map((response) => {
                  const isSelected = selectedResponse?.id === response.id;

                  return (
                    <tr
                      key={response.id}
                      className={`align-top transition hover:bg-slate-50 ${
                        isSelected ? "bg-teal-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold leading-5 text-slate-950">
                          {response.institution_name}
                        </p>

                        {response.inquiry_notes && (
                          <details className="mt-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600">
                            <summary className="cursor-pointer font-bold text-slate-700">
                              Observações
                            </summary>
                            <p className="mt-2 leading-5">
                              {response.inquiry_notes}
                            </p>
                          </details>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className="leading-5 text-slate-700">
                          {response.course_name}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="leading-5 text-slate-700">
                          {shortText(response.requested_area)}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {formatNumber(response.requested_students)}
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {formatWorkload(response.required_workload)}
                      </td>

                      <td className="px-4 py-3">
                        <p className="leading-5 text-slate-700">
                          {shortText(response.intended_period)}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${responseStatusClass(
                            response.response_status,
                          )}`}
                        >
                          {responseStatusLabel(response.response_status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/unidade/sondagens?responder=${response.id}#painel-resposta`}
                          className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold transition ${
                            isSelected
                              ? "bg-teal-700 text-white hover:bg-teal-800"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-800"
                          }`}
                        >
                          {isSelected ? "Selecionada" : "Responder / editar"}
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

      {selectedResponse && (
        <section
          id="painel-resposta"
          className="mt-5 rounded-2xl border border-teal-200 bg-white shadow-sm"
        >
          <div className="border-b border-teal-100 bg-teal-50 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-teal-800">
                  Resposta da unidade
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  {selectedResponse.course_name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedResponse.institution_name}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[480px]">
                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Solicitados
                  </p>
                  <p className="font-black text-slate-900">
                    {formatNumber(selectedResponse.requested_students)}
                  </p>
                </div>

                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Carga
                  </p>
                  <p className="font-black text-slate-900">
                    {formatWorkload(selectedResponse.required_workload)}
                  </p>
                </div>

                <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Período
                  </p>
                  <p className="font-black text-slate-900">
                    {shortText(selectedResponse.intended_period)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
              <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                <p className="text-[11px] font-bold uppercase text-slate-500">
                  Área/setor de interesse
                </p>
                <p className="mt-1 text-slate-700">
                  {shortText(selectedResponse.requested_area)}
                </p>
              </div>

              <div className="rounded-xl border border-teal-100 bg-white px-3 py-2">
                <p className="text-[11px] font-bold uppercase text-slate-500">
                  Observações da instituição
                </p>
                <p className="mt-1 text-slate-700">
                  {shortText(selectedResponse.inquiry_notes)}
                </p>
              </div>
            </div>
          </div>

          <form action={respondUnitInquiry} className="grid gap-4 p-5">
            <input
              type="hidden"
              name="response_id"
              value={selectedResponse.id}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Manifestação da unidade
                <select
                  name="response_status"
                  required
                  defaultValue={selectedResponse.response_status}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="precisa_analise">Precisa de análise</option>
                  <option value="campo_disponivel">Campo disponível</option>
                  <option value="campo_com_limite">Campo com limite</option>
                  <option value="sem_disponibilidade">
                    Sem disponibilidade
                  </option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Quantidade possível
                <input
                  name="available_slots"
                  type="number"
                  min="0"
                  defaultValue={selectedResponse.available_slots ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 2"
                />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Horário possível
                <input
                  name="possible_schedule"
                  defaultValue={selectedResponse.possible_schedule ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: matutino, vespertino, a combinar"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Supervisor
                <input
                  name="supervisor_name"
                  defaultValue={selectedResponse.supervisor_name ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Nome do servidor responsável"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Atividades compatíveis
              <textarea
                name="compatible_activities"
                defaultValue={selectedResponse.compatible_activities ?? ""}
                rows={3}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Descreva as atividades que podem ser desempenhadas pelo estudante."
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Observações da unidade
              <textarea
                name="notes"
                defaultValue={selectedResponse.notes ?? ""}
                rows={3}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Informe condições, limites ou justificativas."
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/unidade/sondagens"
                className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Fechar painel de resposta
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                Salvar resposta
              </button>
            </div>
          </form>
        </section>
      )}
    </SystemShell>
  );
}
