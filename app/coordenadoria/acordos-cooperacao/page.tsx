import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationAgreementsData } from "@/lib/queries/coordination-agreements";
import { updateCoordinationAgreement } from "./actions";
import { CoordinationAgreementCreateForm } from "./CoordinationAgreementCreateForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AcordosCooperacaoPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    status?: string;
    instituicao?: string;
    editar?: string;
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

function buildEditHref(id: string, params: Awaited<AcordosCooperacaoPageProps["searchParams"]>) {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.instituicao) query.set("instituicao", params.instituicao);

  query.set("editar", id);

  return `/coordenadoria/acordos-cooperacao?${query.toString()}#editar-acordo`;
}

export default async function AcordosCooperacaoPage({
  searchParams,
}: AcordosCooperacaoPageProps) {
  const params = await searchParams;

  const {
    agreements,
    institutions,
    viableInquiries,
    viableInstitutions,
    viableCourses,
    error,
  } = await getCoordinationAgreementsData({
    status: params?.status,
    institutionId: params?.instituicao,
  });

  const filtered = hasFilters(params);
  const editingAgreement =
    agreements.find((agreement) => agreement.id === params?.editar) ?? null;

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
      title="Acordos de Cooperação"
      description="Controle acordos, vigência, assinatura, publicação e liberação para apresentação de estudantes."
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
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Acordo registrado com sucesso.
        </section>
      )}

      {params?.sucesso === "2" && (
        <section className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Acordo atualizado com sucesso.
        </section>
      )}

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 md:grid-cols-5">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Exibidos
            </p>
            <p className="text-lg font-black text-slate-950">{agreements.length}</p>
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
              Aptos
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
              <span className="text-xs font-bold text-slate-600">Instituição</span>
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

        <details className="border-b border-slate-200">
          <summary className="cursor-pointer bg-slate-50 px-4 py-2">
            <span className="text-sm font-black uppercase tracking-wide text-slate-700">
              Registrar novo acordo
            </span>
            <span className="ml-3 text-xs font-medium text-slate-500">
              Selecionar instituição e cursos abrangidos
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

        {editingAgreement && (
          <div
            id="editar-acordo"
            className="border-b border-teal-200 bg-teal-50/60 px-4 py-3"
          >
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-teal-900">
                  Editar acordo
                </h2>
                <p className="text-xs text-slate-600">
                  {editingAgreement.institution_name} · criado em{" "}
                  {formatDate(editingAgreement.created_at)}
                </p>
              </div>

              <Link
                href="/coordenadoria/acordos-cooperacao"
                className="text-xs font-black uppercase tracking-wide text-slate-600 hover:text-slate-900"
              >
                Cancelar edição
              </Link>
            </div>

            <form action={updateCoordinationAgreement} className="grid gap-3">
              <input type="hidden" name="id" value={editingAgreement.id} />

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">Situação</span>
                  <select
                    name="status"
                    defaultValue={editingAgreement.status}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                    defaultValue={editingAgreement.started_at ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Fim da vigência
                  </span>
                  <input
                    name="ended_at"
                    type="date"
                    defaultValue={editingAgreement.ended_at ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                    defaultValue={editingAgreement.signed_at ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Data de publicação
                  </span>
                  <input
                    name="published_at"
                    type="date"
                    defaultValue={editingAgreement.published_at ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                    defaultValue={editingAgreement.legal_representative_name ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Responsável da instituição
                  </span>
                  <input
                    name="institution_responsible_name"
                    defaultValue={editingAgreement.institution_responsible_name ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Referência da publicação
                </span>
                <input
                  name="publication_reference"
                  defaultValue={editingAgreement.publication_reference ?? ""}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: Diário Oficial, edição, data ou link da publicação"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Link do documento
                  </span>
                  <input
                    name="document_url"
                    defaultValue={editingAgreement.document_url ?? ""}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Link do acordo assinado ou publicado"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    PDF assinado
                  </span>
                  <input
                    name="document_file"
                    type="file"
                    accept="application/pdf"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-800 hover:file:bg-teal-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">Observações</span>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingAgreement.notes ?? ""}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <div className="flex justify-end gap-2 border-t border-teal-100 pt-3">
                <Link
                  href="/coordenadoria/acordos-cooperacao"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-teal-800"
                >
                  Salvar acordo
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Acordos cadastrados
          </h2>
          <p className="text-xs text-slate-500">
            Controle limitado aos 200 registros mais recentes conforme os filtros aplicados.
          </p>
        </div>

        {agreements.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhum acordo encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[22%] px-2 py-1.5 font-black">Instituição</th>
                  <th className="w-[12%] px-2 py-1.5 font-black">Situação</th>
                  <th className="w-[15%] px-2 py-1.5 font-black">Vigência</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Assinatura</th>
                  <th className="w-[13%] px-2 py-1.5 font-black">Publicação</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Cursos</th>
                  <th className="w-[10%] px-2 py-1.5 font-black">Uso</th>
                  <th className="w-[8%] px-2 py-1.5 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="align-top hover:bg-slate-50">
                    <td className="px-2 py-1.5">
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
                      {formatDate(agreement.started_at)} a{" "}
                      {formatDate(agreement.ended_at)}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      {formatDate(agreement.signed_at)}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      <p>{formatDate(agreement.published_at)}</p>
                      {agreement.publication_reference && (
                        <details className="mt-1 text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Referência
                          </summary>
                          <p className="mt-1 max-w-[220px] leading-5">
                            {agreement.publication_reference}
                          </p>
                        </details>
                      )}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
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
                        href={buildEditHref(agreement.id, params)}
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
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
          A apresentação de estudantes será liberada somente quando o acordo estiver ativo, assinado, publicado e dentro da vigência.
        </div>
      </section>
    </SystemShell>
  );
}
