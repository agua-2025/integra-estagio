import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationAgreementsData } from "@/lib/queries/coordination-agreements";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AcordosCooperacaoPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
    status?: string;
    instituicao?: string;
  }>;
};

const statusOptions = [
  ["rascunho", "Rascunho"],
  ["em_analise", "Em análise"],
  ["pendente_correcao", "Pendente de correção"],
  ["minuta_gerada", "Minuta gerada"],
  ["aguardando_assinatura", "Aguardando assinatura"],
  ["assinado", "Assinado"],
  ["publicado", "Publicado"],
  ["ativo", "Ativo"],
  ["vencido", "Vencido"],
  ["encerrado", "Encerrado"],
  ["cancelado", "Cancelado"],
];

function statusLabel(status: string) {
  return statusOptions.find(([value]) => value === status)?.[1] ?? status;
}

function statusClass(status: string) {
  if (status === "ativo") return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";

  if (
    ["em_analise", "minuta_gerada", "aguardando_assinatura", "assinado", "publicado"].includes(
      status,
    )
  ) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "pendente_correcao") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function effectiveInstitutionReviewStatus(agreement: {
  draft_text: string | null;
  institution_review_status: string | null;
}) {
  if (agreement.institution_review_status) {
    return agreement.institution_review_status;
  }

  if (agreement.draft_text) {
    return "aguardando_conferencia";
  }

  return null;
}

function institutionReviewLabel(status: string | null) {
  const labels: Record<string, string> = {
    aguardando_conferencia: "Aguardando",
    aprovada: "Aprovada",
    correcao_solicitada: "Correção",
  };

  if (!status) return "Não enviada";

  return labels[status] ?? status;
}

function institutionReviewClass(status: string | null) {
  if (status === "aprovada") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "correcao_solicitada") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "aguardando_conferencia") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
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

function hasFilters(params: Awaited<AcordosCooperacaoPageProps["searchParams"]>) {
  return Boolean(params?.status || params?.instituicao);
}

export default async function AcordosCooperacaoPage({
  searchParams,
}: AcordosCooperacaoPageProps) {
  const params = await searchParams;

  const { agreements, institutions, error } = await getCoordinationAgreementsData({
    status: params?.status,
    institutionId: params?.instituicao,
  });

  const filtered = hasFilters(params);
  const activeCount = agreements.filter((item) => item.status === "ativo").length;
  const signingCount = agreements.filter((item) =>
    ["minuta_gerada", "aguardando_assinatura", "assinado", "publicado"].includes(
      item.status,
    ),
  ).length;
  const pendingCount = agreements.filter((item) =>
    ["rascunho", "em_analise", "pendente_correcao"].includes(item.status),
  ).length;
  const readyCount = agreements.filter((item) => item.is_ready_for_presentations).length;
  const correctionCount = agreements.filter(
    (item) => item.institution_review_status === "correcao_solicitada",
  ).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Acordos de Cooperação"
      description="Controle acordos, vigência, assinatura, publicação e liberação para apresentação de estagiários."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/coordenadoria/acordos-cooperacao/novo"
            className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
          >
            Novo acordo
          </Link>

          <Link
            href="/coordenadoria/sondagens"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver sondagens
          </Link>
        </div>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
          Acordo registrado com sucesso.
        </section>
      )}

      {params?.sucesso === "2" && (
        <section className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
          Acordo atualizado com sucesso.
        </section>
      )}

      {(error || params?.erro) && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error ? `Não foi possível carregar os acordos: ${error}` : params?.erro}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 md:grid-cols-6">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Exibidos
            </p>
            <p className="text-lg font-black text-slate-950">{agreements.length}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-lg font-black text-amber-700">{pendingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Assinatura/publicação
            </p>
            <p className="text-lg font-black text-sky-700">{signingCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Ativos
            </p>
            <p className="text-lg font-black text-teal-700">{activeCount}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Correções
            </p>
            <p className="text-lg font-black text-red-700">{correctionCount}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Liberados
            </p>
            <p className="text-lg font-black text-teal-700">{readyCount}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="text-xs text-slate-500">
                O acordo nasce na Coordenadoria, com base em sondagem viável e instituição validada.
              </p>
            </div>

            {filtered && (
              <Link
                href="/coordenadoria/acordos-cooperacao"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Situação
              </span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] font-semibold text-slate-600">
                Instituição
              </span>
              <select
                name="instituicao"
                defaultValue={params?.instituicao ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.label}
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

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Acordos cadastrados
          </h2>
        </div>

        {agreements.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum acordo encontrado.
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[23%] px-2 py-1.5 font-black">Instituição</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Situação</th>
                  <th className="w-[13%] px-2 py-1.5 font-black">Vigência</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Assinatura</th>
                  <th className="w-[12%] px-2 py-1.5 font-black">Publicação</th>
                  <th className="w-[8%] px-2 py-1.5 font-black">Cursos</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Conferência</th>
                  <th className="w-[7%] px-2 py-1.5 font-black">Uso</th>
                  <th className="w-[7%] px-2 py-1.5 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="align-top hover:bg-slate-50">
                    <td className="px-2 py-1.5">
                      <p className="font-black text-slate-950">
                        {agreement.institution_name}
                      </p>
                      {agreement.requested_area && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Área: {agreement.requested_area}
                        </p>
                      )}
                    </td>

                    <td className="px-2 py-1.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          agreement.status,
                        )}`}
                      >
                        {statusLabel(agreement.status)}
                      </span>
                    </td>

                    <td className="px-2 py-1.5 font-semibold text-slate-800">
                      {formatDate(agreement.started_at)} a {formatDate(agreement.ended_at)}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      {formatDate(agreement.signed_at)}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      <p>{formatDate(agreement.published_at)}</p>
                      {agreement.publication_reference && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {agreement.publication_reference}
                        </p>
                      )}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      {agreement.course_names.length > 0
                        ? `${agreement.course_names.length} curso(s)`
                        : "-"}
                    </td>

                    <td className="px-2 py-1.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${institutionReviewClass(
                          effectiveInstitutionReviewStatus(agreement),
                        )}`}
                      >
                        {institutionReviewLabel(effectiveInstitutionReviewStatus(agreement))}
                      </span>
                      {effectiveInstitutionReviewStatus(agreement) === "correcao_solicitada" &&
                        agreement.institution_review_notes && (
                          <details className="mt-1 text-[11px] text-red-700">
                            <summary className="cursor-pointer font-bold">
                              Ver motivo
                            </summary>
                            <p className="mt-1 max-w-[220px] whitespace-pre-wrap leading-5">
                              {agreement.institution_review_notes}
                            </p>
                          </details>
                        )}
                    </td>

                    <td className="px-2 py-1.5">
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

                    <td className="px-2 py-1.5 text-right">
                      <Link
                        href={`/coordenadoria/acordos-cooperacao/${agreement.id}`}
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          A apresentação de estagiários será liberada somente quando o acordo estiver ativo,
          assinado, publicado, dentro da vigência e vinculado a instituição validada.
        </div>
      </section>
    </SystemShell>
  );
}
