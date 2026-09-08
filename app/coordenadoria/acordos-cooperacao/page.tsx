import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationAgreementsData } from "@/lib/queries/coordination-agreements";
import {
  cancelCoordinationAgreementEdit,
  updateCoordinationAgreement,
} from "./actions";
import { CoordinationAgreementCreateForm } from "./CoordinationAgreementCreateForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AcordosCooperacaoPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
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

function hasFilters(params: Awaited<AcordosCooperacaoPageProps["searchParams"]>) {
  return Boolean(params?.status || params?.instituicao);
}

export default async function AcordosCooperacaoPage({
  searchParams,
}: AcordosCooperacaoPageProps) {
  const params = await searchParams;

  const { agreements, institutions, viableInquiries, viableInstitutions, viableCourses, error } =
    await getCoordinationAgreementsData({
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
  const readyCount = agreements.filter(
    (item) => item.is_ready_for_presentations,
  ).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Acordos de Cooperação Técnica"
      description="Controle acordos firmados com instituições de ensino, vigência, assinatura, publicação e liberação para apresentação de estudantes."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/sondagens"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Acordo registrado com sucesso.
        </section>
      )}

      {params?.sucesso === "2" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Acordo atualizado com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                Localize acordos por situação ou instituição.
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
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
              <span className="text-xs font-bold text-slate-600">Instituição</span>
              <select
                name="instituicao"
                defaultValue={params?.instituicao ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                className="h-9 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>
      </section>

      <details className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-black uppercase tracking-wide text-slate-700">
            Registrar novo acordo
          </span>
          <span className="ml-3 text-xs font-medium text-slate-500">
            Selecione a instituição uma única vez e marque os cursos abrangidos
          </span>
        </summary>

        {viableInquiries.length === 0 ? (
          <div className="px-4 py-3 text-sm font-semibold text-slate-600">
            Nenhuma sondagem viável disponível para novo acordo.
          </div>
        ) : (
          <CoordinationAgreementCreateForm
            viableInstitutions={viableInstitutions}
            viableCourses={viableCourses}
          />
        )}
      </details>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Acordos cadastrados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Controle limitado aos 200 registros mais recentes conforme os filtros aplicados.
          </p>
        </div>

        {agreements.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum acordo encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Situação</th>
                  <th className="px-3 py-2 font-black">Vigência</th>
                  <th className="px-3 py-2 font-black">Assinatura</th>
                  <th className="px-3 py-2 font-black">Publicação</th>
                  <th className="px-3 py-2 font-black">Cursos</th>
                  <th className="px-3 py-2 font-black">Uso</th>
                  <th className="px-3 py-2 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="align-top hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-black text-slate-950">
                        {agreement.institution_name}
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

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          agreement.status,
                        )}`}
                      >
                        {statusLabel(agreement.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {formatDate(agreement.started_at)} a {formatDate(agreement.ended_at)}
                    </td>

                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(agreement.signed_at)}
                    </td>

                    <td className="px-3 py-2 text-slate-700">
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

                    <td className="px-3 py-2 text-slate-700">
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

                    <td className="px-3 py-2">
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

                    <td className="px-3 py-2 text-right">
                      <details className="relative">
                        <summary className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800">
                          Editar
                        </summary>

                        <div className="fixed left-1/2 top-24 z-50 max-h-[calc(100vh-8rem)] w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xl">
                          <form action={updateCoordinationAgreement} className="grid gap-3">
                            <input type="hidden" name="id" value={agreement.id} />

                            <div className="grid gap-3 md:grid-cols-3">
                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Situação
                                </span>
                                <select
                                  name="status"
                                  defaultValue={agreement.status}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                >
                                  {statusOptions.map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Início da vigência
                                </span>
                                <input
                                  name="started_at"
                                  type="date"
                                  defaultValue={agreement.started_at ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>

                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Fim da vigência
                                </span>
                                <input
                                  name="ended_at"
                                  type="date"
                                  defaultValue={agreement.ended_at ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Data de assinatura
                                </span>
                                <input
                                  name="signed_at"
                                  type="date"
                                  defaultValue={agreement.signed_at ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>

                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Data de publicação
                                </span>
                                <input
                                  name="published_at"
                                  type="date"
                                  defaultValue={agreement.published_at ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Representante legal
                                </span>
                                <input
                                  name="legal_representative_name"
                                  defaultValue={agreement.legal_representative_name ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>

                              <label className="grid gap-1">
                                <span className="text-xs font-bold text-slate-600">
                                  Responsável da instituição
                                </span>
                                <input
                                  name="institution_responsible_name"
                                  defaultValue={agreement.institution_responsible_name ?? ""}
                                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                />
                              </label>
                            </div>

                            <label className="grid gap-1">
                              <span className="text-xs font-bold text-slate-600">
                                Referência da publicação
                              </span>
                              <input
                                name="publication_reference"
                                defaultValue={agreement.publication_reference ?? ""}
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                placeholder="Ex.: Diário Oficial, edição, data ou link da publicação"
                              />
                            </label>

                            <label className="grid gap-1">
                              <span className="text-xs font-bold text-slate-600">
                                Link do documento
                              </span>
                              <input
                                name="document_url"
                                defaultValue={agreement.document_url ?? ""}
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                placeholder="Por enquanto, cole aqui o link do acordo assinado ou publicado"
                              />
                            </label>

                            <label className="grid gap-1">
                              <span className="text-xs font-bold text-slate-600">
                                Observações
                              </span>
                              <textarea
                                name="notes"
                                rows={3}
                                defaultValue={agreement.notes ?? ""}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                              />
                            </label>

                            <div className="flex justify-end gap-2">
                              <button
                                type="submit"
                                formAction={cancelCoordinationAgreementEdit}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                              >
                                Cancelar edição
                              </button>

                              <button
                                type="submit"
                                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-teal-800"
                              >
                                Salvar acordo
                              </button>
                            </div>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A apresentação de estudantes será liberada somente quando o acordo estiver ativo, assinado, publicado e dentro da vigência.
        </div>
      </section>
    </SystemShell>
  );
}
