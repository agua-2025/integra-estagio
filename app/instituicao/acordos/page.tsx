import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAgreementsData } from "@/lib/queries/institution-agreements";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoAcordosPageProps = {
  searchParams?: Promise<{
    status?: string;
    curso?: string;
  }>;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    minuta_gerada: "Minuta gerada",
    aguardando_assinatura: "Aguardando assinatura",
    assinado: "Assinado",
    publicado: "Publicado",
    ativo: "Ativo",
    vencido: "Vencido",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "ativo") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (
    status === "em_analise" ||
    status === "minuta_gerada" ||
    status === "aguardando_assinatura" ||
    status === "assinado" ||
    status === "publicado"
  ) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "pendente_correcao") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (["vencido", "encerrado", "cancelado"].includes(status)) {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function hasFilters(params: Awaited<InstituicaoAcordosPageProps["searchParams"]>) {
  return Boolean(params?.status || params?.curso);
}

export default async function InstituicaoAcordosPage({
  searchParams,
}: InstituicaoAcordosPageProps) {
  const params = await searchParams;

  const { institution, agreements, courses, error } =
    await getInstitutionAgreementsData({
      status: params?.status,
      courseId: params?.curso,
    });

  const filtered = hasFilters(params);

  const activeCount = agreements.filter((item) => item.status === "ativo").length;
  const signingCount = agreements.filter((item) =>
    ["minuta_gerada", "aguardando_assinatura", "assinado", "publicado"].includes(
      item.status,
    ),
  ).length;
  const pendingCount = agreements.filter((item) =>
    ["em_analise", "pendente_correcao", "rascunho"].includes(item.status),
  ).length;
  const readyCount = agreements.filter(
    (item) => item.is_ready_for_presentations,
  ).length;

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Acompanhar acordos"
      description="Consulte acordos de cooperação vinculados à instituição."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/sondagens"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-5">
          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Exibidos
            </p>
            <p className="text-xl font-black text-slate-950">
              {agreements.length}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-xl font-black text-amber-700">{pendingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Assinatura/publicação
            </p>
            <p className="text-xl font-black text-sky-700">{signingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Ativos
            </p>
            <p className="text-xl font-black text-teal-700">{activeCount}</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Aptos
            </p>
            <p className="text-xl font-black text-teal-700">{readyCount}</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Localize acordos por situação ou curso abrangido.
              </p>
            </div>

            {filtered && (
              <Link
                href="/instituicao/acordos"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                <option value="em_analise">Em análise</option>
                <option value="pendente_correcao">Pendente de correção</option>
                <option value="minuta_gerada">Minuta gerada</option>
                <option value="aguardando_assinatura">Aguardando assinatura</option>
                <option value="assinado">Assinado</option>
                <option value="publicado">Publicado</option>
                <option value="ativo">Ativo</option>
                <option value="vencido">Vencido</option>
                <option value="encerrado">Encerrado</option>
                <option value="cancelado">Cancelado</option>
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
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Acordos da instituição
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Consulta limitada aos 200 registros mais recentes conforme os filtros aplicados.
          </p>
        </div>

        {agreements.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum acordo encontrado para a instituição.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Acordo</th>
                  <th className="px-3 py-2 font-black">Situação</th>
                  <th className="px-3 py-2 font-black">Vigência</th>
                  <th className="px-3 py-2 font-black">Assinatura</th>
                  <th className="px-3 py-2 font-black">Publicação</th>
                  <th className="px-3 py-2 font-black">Cursos</th>
                  <th className="px-3 py-2 font-black">Uso</th>
                  <th className="px-3 py-2 font-black">Observações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">
                        Acordo de Cooperação Técnica
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Criado em {formatDate(agreement.created_at)}
                      </p>
                      {agreement.requested_area && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Área: {agreement.requested_area}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          agreement.status,
                        )}`}
                      >
                        {statusLabel(agreement.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {formatDate(agreement.started_at)} a{" "}
                      {formatDate(agreement.ended_at)}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(agreement.signed_at)}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <p>{formatDate(agreement.published_at)}</p>
                      {agreement.publication_reference && (
                        <details className="mt-1 text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Referência
                          </summary>
                          <p className="mt-1 max-w-[260px] leading-5">
                            {agreement.publication_reference}
                          </p>
                        </details>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {agreement.course_names.length > 0 ? (
                        <details>
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            {agreement.course_names.length} curso(s)
                          </summary>
                          <div className="mt-1 flex max-w-[300px] flex-wrap gap-1">
                            {agreement.course_names.map((course) => (
                              <span
                                key={course}
                                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </details>
                      ) : (
                        "Não informado"
                      )}
                    </td>

                    <td className="px-3 py-2 align-top">
                      {agreement.is_ready_for_presentations ? (
                        <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200">
                          Libera apresentação
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                          Não liberado
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {agreement.notes ? (
                        <details>
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Ver
                          </summary>
                          <p className="mt-1 max-w-[320px] leading-5">
                            {agreement.notes}
                          </p>
                        </details>
                      ) : (
                        "-"
                      )}

                      {agreement.document_url && (
                        <p className="mt-1">
                          <a
                            href={agreement.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-teal-700 hover:text-teal-900"
                          >
                            Documento
                          </a>
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
          A apresentação de estudantes exige acordo ativo, assinado, publicado e dentro da vigência.
        </div>
      </section>
    </SystemShell>
  );
}
