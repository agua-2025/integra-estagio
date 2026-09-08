import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionInquiriesData } from "@/lib/queries/institution-inquiries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoSondagensPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    status?: string;
    curso?: string;
    busca?: string;
  }>;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    recebida: "Recebida",
    enviada: "Enviada",
    em_analise: "Em análise",
    encaminhada: "Encaminhada",
    encaminhada_unidade: "Encaminhada",
    aguardando_unidade: "Aguardando unidade",
    viavel: "Viável",
    viavel_parcial: "Viável parcial",
    parcialmente_viavel: "Parcial",
    sem_disponibilidade: "Sem disponibilidade",
    inviavel: "Inviável",
    complementacao_solicitada: "Complementação solicitada",
    pendente: "Pendente",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (
    status === "parcialmente_viavel" ||
    status === "viavel_parcial" ||
    status === "em_analise" ||
    status === "encaminhada" ||
    status === "encaminhada_unidade" ||
    status === "aguardando_unidade" ||
    status === "complementacao_solicitada"
  ) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "inviavel" || status === "sem_disponibilidade") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function decisionLabel(decision: string | null) {
  const labels: Record<string, string> = {
    viavel: "Viável",
    viavel_parcial: "Viável parcial",
    parcialmente_viavel: "Parcial",
    sem_disponibilidade: "Sem disponibilidade",
    inviavel: "Inviável",
    complementacao_solicitada: "Complementação solicitada",
    precisa_complementacao: "Complementar",
  };

  return decision ? labels[decision] ?? decision : "Aguardando";
}

function decisionClass(decision: string | null) {
  if (decision === "viavel") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (decision === "parcialmente_viavel" || decision === "viavel_parcial") {
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
  if (value === null || value === undefined) return "-";
  return String(value);
}

function formatWorkload(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${value}h`;
}

function hasFilters(params: Awaited<InstituicaoSondagensPageProps["searchParams"]>) {
  return Boolean(params?.status || params?.curso || params?.busca);
}

export default async function InstituicaoSondagensPage({
  searchParams,
}: InstituicaoSondagensPageProps) {
  const params = await searchParams;

  const { institution, courses, inquiries, error } =
    await getInstitutionInquiriesData({
      status: params?.status,
      courseId: params?.curso,
      search: params?.busca,
    });

  const filtered = hasFilters(params);
  const institutionIsActive = institution?.status === "ativa";

  const inAnalysisCount = inquiries.filter((item) =>
    [
      "recebida",
      "em_analise",
      "encaminhada",
      "encaminhada_unidade",
      "aguardando_unidade",
      "pendente",
    ].includes(item.status),
  ).length;

  const viableCount = inquiries.filter((item) =>
    ["viavel", "parcialmente_viavel", "viavel_parcial"].includes(item.status),
  ).length;

  const concludedCount = inquiries.filter((item) =>
    Boolean(item.coordination_decision),
  ).length;

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Acompanhar sondagens"
      description="Consulte sondagens enviadas e conclusões emitidas pela Coordenadoria."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/sondagens/nova"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
        >
          Nova sondagem
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Sondagem enviada com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!institutionIsActive && (
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          A instituição precisa estar ativa para solicitar novas sondagens.
        </section>
      )}

      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-4">
          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Exibidas
            </p>
            <p className="text-xl font-black text-slate-950">{inquiries.length}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Em análise
            </p>
            <p className="text-xl font-black text-sky-800">{inAnalysisCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Viáveis
            </p>
            <p className="text-xl font-black text-teal-800">{viableCount}</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Concluídas
            </p>
            <p className="text-xl font-black text-slate-950">{concludedCount}</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Localize por situação, curso, área, período ou observação.
              </p>
            </div>

            {filtered && (
              <Link
                href="/instituicao/sondagens"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-[200px_260px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                <option value="em_analise">Em análise</option>
                <option value="viavel">Viáveis</option>
                <option value="sem_disponibilidade">Sem disponibilidade</option>
                <option value="complementacao">Complementação</option>
                <option value="concluida">Concluídas</option>
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
                placeholder="Área, período ou observação"
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
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
              Sondagens enviadas
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Consulta limitada aos 200 registros mais recentes conforme os filtros aplicados.
            </p>
          </div>
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
                  <th className="w-[185px] px-3 py-2 font-black">Curso</th>
                  <th className="w-[190px] px-3 py-2 font-black">Área/Setor</th>
                  <th className="w-[70px] px-3 py-2 text-center font-black">Pedido</th>
                  <th className="w-[70px] px-3 py-2 text-center font-black">Carga</th>
                  <th className="w-[115px] px-3 py-2 font-black">Status</th>
                  <th className="w-[130px] px-3 py-2 font-black">Conclusão</th>
                  <th className="w-[220px] px-3 py-2 font-black">Resultado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="align-top hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-bold leading-5 text-slate-950">
                        {inquiry.course_name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(inquiry.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </td>

                    <td className="px-3 py-2">
                      <p className="leading-5 text-slate-700">
                        {inquiry.requested_area ?? "Não informada"}
                      </p>

                      {inquiry.notes && (
                        <details className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                          <summary className="cursor-pointer font-bold text-slate-700">
                            Obs.
                          </summary>
                          <p className="mt-1 leading-5">{inquiry.notes}</p>
                        </details>
                      )}
                    </td>

                    <td className="px-3 py-2 text-center font-bold text-slate-800">
                      {formatNumber(inquiry.requested_students)}
                    </td>

                    <td className="px-3 py-2 text-center font-bold text-slate-800">
                      {formatWorkload(inquiry.required_workload)}
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
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${decisionClass(
                          inquiry.coordination_decision,
                        )}`}
                      >
                        {decisionLabel(inquiry.coordination_decision)}
                      </span>

                      {inquiry.coordination_decided_at && (
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                          {new Date(inquiry.coordination_decided_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {inquiry.coordination_decision ? (
                        <div className="grid gap-1">
                          <p className="font-bold text-slate-900">
                            {inquiry.coordination_approved_students !== null
                              ? `${inquiry.coordination_approved_students} autorizado(s)`
                              : "Quantidade não informada"}
                          </p>

                          <p className="text-[11px] font-semibold text-slate-500">
                            Pedido: {formatNumber(inquiry.requested_students)}
                          </p>

                          {inquiry.coordination_notes && (
                            <details className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                              <summary className="cursor-pointer font-bold text-slate-700">
                                Obs. Coordenadoria
                              </summary>
                              <p className="mt-1 leading-5">
                                {inquiry.coordination_notes}
                              </p>
                            </details>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold leading-5 text-slate-500">
                          Em análise.
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A instituição acompanha aqui a análise das sondagens enviadas à Coordenadoria.
        </div>
      </section>
    </SystemShell>
  );
}
