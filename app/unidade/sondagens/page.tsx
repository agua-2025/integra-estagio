import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInquiriesData } from "@/lib/queries/unit-inquiries";
import { respondUnitInquiry } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UnidadeSondagensPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    responder?: string;
    status?: string;
    curso?: string;
    instituicao?: string;
    busca?: string;
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
  if (value === null || value === undefined) return "-";
  return String(value);
}

function formatWorkload(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${value}h`;
}

function shortText(value: string | null, fallback = "-") {
  if (!value) return fallback;
  return value;
}

export default async function UnidadeSondagensPage({
  searchParams,
}: UnidadeSondagensPageProps) {
  const params = await searchParams;
  const { unitName, responses, institutions, courses, error } =
    await getUnitInquiriesData({
      status: params?.status,
      course: params?.curso,
      institution: params?.instituicao,
      search: params?.busca,
    });

  const selectedResponse =
    responses.find((item) => item.id === params?.responder) ?? null;

  const pendingCount = responses.filter(
    (item) => item.response_status === "precisa_analise",
  ).length;

  const acceptedCount = responses.filter((item) =>
    ["campo_disponivel", "campo_com_limite"].includes(item.response_status),
  ).length;

  const unavailableCount = responses.filter(
    (item) => item.response_status === "sem_disponibilidade",
  ).length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Responder sondagens"
      description={
        unitName
          ? `Manifeste a disponibilidade da unidade ${unitName} para receber estudantes.`
          : "Analise consultas encaminhadas pela Coordenadoria e informe se há campo disponível."
      }
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        {selectedResponse && (
          <Link
            href="#painel-resposta"
            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:border-teal-300 hover:bg-teal-100"
          >
            Ir para resposta selecionada
          </Link>
        )}
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Resposta da unidade salva com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-4">
          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Recebidas
            </p>
            <p className="text-xl font-black text-slate-950">{responses.length}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-xl font-black text-sky-800">{pendingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Aceitas
            </p>
            <p className="text-xl font-black text-teal-800">{acceptedCount}</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Sem disponibilidade
            </p>
            <p className="text-xl font-black text-red-700">{unavailableCount}</p>
          </div>
        </div>

        <div className="px-4 py-3 text-xs font-medium text-slate-500">
          Responda cada sondagem conforme a disponibilidade real da unidade municipal.
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                Sondagens encaminhadas
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Filtre e selecione uma linha para registrar ou alterar a manifestação da unidade.
              </p>
            </div>

            {(params?.status || params?.curso || params?.instituicao || params?.busca) && (
              <Link
                href="/unidade/sondagens"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-[190px_220px_220px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                <option value="precisa_analise">Aguardando análise</option>
                <option value="campo_disponivel">Disponível</option>
                <option value="campo_com_limite">Com limite</option>
                <option value="sem_disponibilidade">Sem disponibilidade</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Instituição</span>
              <select
                name="instituicao"
                defaultValue={params?.instituicao ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Curso</span>
              <select
                name="curso"
                defaultValue={params?.curso ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Busca</span>
              <input
                name="busca"
                defaultValue={params?.busca ?? ""}
                placeholder="Área, curso ou observação"
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-9 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>

        {responses.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhuma sondagem encaminhada para esta unidade.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead className="bg-slate-100 uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[180px] px-3 py-2 font-black">Instituição</th>
                  <th className="w-[160px] px-3 py-2 font-black">Curso</th>
                  <th className="w-[210px] px-3 py-2 font-black">Área/Setor</th>
                  <th className="w-[70px] px-3 py-2 text-center font-black">Qtd.</th>
                  <th className="w-[80px] px-3 py-2 text-center font-black">Carga</th>
                  <th className="w-[120px] px-3 py-2 font-black">Período</th>
                  <th className="w-[125px] px-3 py-2 font-black">Status</th>
                  <th className="w-[115px] px-3 py-2 text-right font-black">Ação</th>
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
                      <td className="px-3 py-2">
                        <p className="font-bold leading-5 text-slate-950">
                          {response.institution_name}
                        </p>

                        {response.inquiry_notes && (
                          <details className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                            <summary className="cursor-pointer font-bold text-slate-700">
                              Obs.
                            </summary>
                            <p className="mt-1 leading-5">{response.inquiry_notes}</p>
                          </details>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <p className="leading-5 text-slate-700">
                          {response.course_name}
                        </p>
                      </td>

                      <td className="px-3 py-2">
                        <p className="leading-5 text-slate-700">
                          {shortText(response.requested_area)}
                        </p>
                      </td>

                      <td className="px-3 py-2 text-center font-bold text-slate-800">
                        {formatNumber(response.requested_students)}
                      </td>

                      <td className="px-3 py-2 text-center font-bold text-slate-800">
                        {formatWorkload(response.required_workload)}
                      </td>

                      <td className="px-3 py-2 text-slate-700">
                        {shortText(response.intended_period)}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${responseStatusClass(
                            response.response_status,
                          )}`}
                        >
                          {responseStatusLabel(response.response_status)}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/unidade/sondagens?responder=${response.id}#painel-resposta`}
                          className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold transition ${
                            isSelected
                              ? "bg-teal-700 text-white hover:bg-teal-800"
                              : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-800"
                          }`}
                        >
                          {isSelected ? "Selecionada" : "Responder"}
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
          className="mt-4 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm"
        >
          <div className="border-b border-teal-100 bg-teal-50 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-teal-800">
                  Resposta da unidade
                </p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">
                  {selectedResponse.course_name}
                </h2>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  {selectedResponse.institution_name}
                </p>
              </div>

              <div className="grid gap-2 text-xs sm:grid-cols-3 lg:min-w-[430px]">
                <div className="rounded-lg border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Solicitados
                  </p>
                  <p className="font-black text-slate-900">
                    {formatNumber(selectedResponse.requested_students)}
                  </p>
                </div>

                <div className="rounded-lg border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Carga
                  </p>
                  <p className="font-black text-slate-900">
                    {formatWorkload(selectedResponse.required_workload)}
                  </p>
                </div>

                <div className="rounded-lg border border-teal-100 bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Período
                  </p>
                  <p className="font-black text-slate-900">
                    {shortText(selectedResponse.intended_period)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form action={respondUnitInquiry} className="grid gap-3 px-4 py-4">
            <input type="hidden" name="response_id" value={selectedResponse.id} />

            <div className="grid gap-3 lg:grid-cols-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Manifestação
                </span>
                <select
                  name="response_status"
                  required
                  defaultValue={selectedResponse.response_status}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="precisa_analise">Precisa de análise</option>
                  <option value="campo_disponivel">Campo disponível</option>
                  <option value="campo_com_limite">Campo com limite</option>
                  <option value="sem_disponibilidade">Sem disponibilidade</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Quantidade possível
                </span>
                <input
                  name="available_slots"
                  type="number"
                  min="0"
                  defaultValue={selectedResponse.available_slots ?? ""}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 2"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Horário possível
                </span>
                <input
                  name="possible_schedule"
                  defaultValue={selectedResponse.possible_schedule ?? ""}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: matutino"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Supervisor
                </span>
                <input
                  name="supervisor_name"
                  defaultValue={selectedResponse.supervisor_name ?? ""}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Servidor responsável"
                />
              </label>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Atividades compatíveis
                </span>
                <textarea
                  name="compatible_activities"
                  defaultValue={selectedResponse.compatible_activities ?? ""}
                  rows={3}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Descreva as atividades possíveis."
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Observações da unidade
                </span>
                <textarea
                  name="notes"
                  defaultValue={selectedResponse.notes ?? ""}
                  rows={3}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Informe condições, limites ou justificativas."
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/unidade/sondagens"
                className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Fechar painel de resposta
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
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
