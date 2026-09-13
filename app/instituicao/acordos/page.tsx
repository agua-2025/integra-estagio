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

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
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
      title="Acordos"
      description="Consulte a situação, vigência, cursos abrangidos e documentos dos acordos."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/sondagens"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-5">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Instituição
            </p>
            <p className="text-sm font-black text-slate-950">
              {institution?.name ?? "Instituição não identificada"}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-lg font-black text-amber-700">{pendingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Assinatura/publicação
            </p>
            <p className="text-lg font-black text-sky-700">{signingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Ativos
            </p>
            <p className="text-lg font-black text-teal-700">{activeCount}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Liberados
            </p>
            <p className="text-lg font-black text-teal-700">{readyCount}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Acordos da instituição
              </h2>
              <p className="text-xs text-slate-500">
                Filtre e consulte os acordos vinculados à instituição.
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
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                className="h-8 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>

        {agreements.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum acordo encontrado para a instituição.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[18%] px-2 py-1.5 font-black">Acordo</th>
                  <th className="w-[12%] px-2 py-1.5 font-black">Situação</th>
                  <th className="w-[16%] px-2 py-1.5 font-black">Vigência</th>
                  <th className="w-[17%] px-2 py-1.5 font-black">Formalização</th>
                  <th className="w-[12%] px-2 py-1.5 font-black">Cursos</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Uso</th>
                  <th className="w-[15%] px-2 py-1.5 font-black">Documento</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5 align-top">
                      <p className="font-black text-slate-950">
                        Acordo de Cooperação
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

                    <td className="px-2 py-1.5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          agreement.status,
                        )}`}
                      >
                        {statusLabel(agreement.status)}
                      </span>
                    </td>

                    <td className="px-2 py-1.5 align-top font-semibold text-slate-800">
                      {formatDate(agreement.started_at)} a{" "}
                      {formatDate(agreement.ended_at)}
                    </td>

                    <td className="px-2 py-1.5 align-top text-slate-700">
                      <p>Ass.: {formatDate(agreement.signed_at)}</p>
                      <p className="mt-0.5">
                        Pub.: {formatDate(agreement.published_at)}
                      </p>

                      {agreement.publication_reference && (
                        <details className="mt-1 text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Referência
                          </summary>
                          <p className="mt-1 max-w-[240px] leading-5">
                            {agreement.publication_reference}
                          </p>
                        </details>
                      )}
                    </td>

                    <td className="px-2 py-1.5 align-top text-slate-700">
                      {agreement.course_names.length > 0 ? (
                        <details>
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            {agreement.course_names.length} curso(s)
                          </summary>
                          <div className="mt-1 flex max-w-[240px] flex-wrap gap-1">
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

                    <td className="px-2 py-1.5 align-top">
                      {agreement.is_ready_for_presentations ? (
                        <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200">
                          Liberado
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                          Pendente
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-1.5 align-top text-slate-700">
                      {agreement.document_url ? (
                        <a
                          href={agreement.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-800 transition hover:bg-teal-100"
                        >
                          Abrir PDF
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Não anexado
                        </span>
                      )}

                      {agreement.notes && (
                        <details className="mt-1 text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Observações
                          </summary>
                          <p className="mt-1 max-w-[260px] leading-5">
                            {agreement.notes}
                          </p>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          A apresentação de estudantes exige acordo ativo, assinado, publicado e dentro da vigência.
        </div>
      </section>
    </SystemShell>
  );
}
