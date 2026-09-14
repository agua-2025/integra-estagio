import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationAgreementsData } from "@/lib/queries/coordination-agreements";
import {
  generateCoordinationAgreementDraft,
  updateCoordinationAgreement,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AcordoDetalhePageProps = {
  params: Promise<{
    id: string;
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

function formatDate(value: string | null) {
  if (!value) return "-";

  const parts = value.slice(0, 10).split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return value;
}

export default async function AcordoDetalhePage({ params }: AcordoDetalhePageProps) {
  const { id } = await params;
  const { agreements, error } = await getCoordinationAgreementsData();

  const agreement = agreements.find((item) => item.id === id);

  if (!agreement) {
    notFound();
  }

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Editar Acordo de Cooperação"
      description="Atualize vigência, assinatura, publicação, documento e situação do acordo."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/acordos-cooperacao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para acordos
        </Link>

        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${statusClass(
            agreement.status,
          )}`}
        >
          {statusLabel(agreement.status)}
        </span>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Não foi possível carregar o acordo: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Dados do acordo
          </h2>
          <p className="text-xs text-slate-500">
            Os dados cadastrais da instituição vêm do cadastro institucional validado.
          </p>
        </div>

        <div className="grid gap-3 p-3 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="w-40 bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Instituição
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {agreement.institution_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Área da sondagem
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {agreement.requested_area ?? "Não informada"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Cursos abrangidos
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {agreement.course_names.length > 0
                        ? agreement.course_names.join(", ")
                        : "Nenhum curso vinculado"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Vigência
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {formatDate(agreement.started_at)} a {formatDate(agreement.ended_at)}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Assinatura
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {formatDate(agreement.signed_at)}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Publicação
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {formatDate(agreement.published_at)}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Referência
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {agreement.publication_reference ?? "Não informada"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Documento
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {agreement.document_url ? (
                        <a
                          href={agreement.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-teal-700 hover:text-teal-900"
                        >
                          Abrir documento
                        </a>
                      ) : (
                        "Não informado"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                      Uso
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {agreement.is_ready_for_presentations
                        ? "Liberado para apresentação de estagiários"
                        : "Ainda não liberado"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {agreement.notes && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <p className="font-bold text-slate-600">Observações</p>
                <p className="mt-1 whitespace-pre-wrap">{agreement.notes}</p>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                    Minuta do acordo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Gerada com base no cadastro institucional validado, cursos e vigência do acordo.
                  </p>
                </div>

                <form action={generateCoordinationAgreementDraft}>
                  <input type="hidden" name="id" value={agreement.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                  >
                    Gerar minuta
                  </button>
                </form>
              </div>

              {agreement.draft_text ? (
                <div className="max-h-[520px] overflow-auto bg-white p-3">
                  <pre className="whitespace-pre-wrap text-xs leading-5 text-slate-800">
                    {agreement.draft_text}
                  </pre>
                </div>
              ) : (
                <div className="p-3 text-xs font-semibold text-slate-600">
                  Nenhuma minuta gerada para este acordo.
                </div>
              )}
            </div>
          </div>

          <form
            action={updateCoordinationAgreement}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <input type="hidden" name="id" value={agreement.id} />

            <div className="grid gap-2">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Situação
                </span>
                <select
                  name="status"
                  defaultValue={agreement.status}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  {statusOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Início da vigência
                  </span>
                  <input
                    name="started_at"
                    type="date"
                    defaultValue={agreement.started_at ?? ""}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Fim da vigência
                  </span>
                  <input
                    name="ended_at"
                    type="date"
                    defaultValue={agreement.ended_at ?? ""}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Data de assinatura
                  </span>
                  <input
                    name="signed_at"
                    type="date"
                    defaultValue={agreement.signed_at ?? ""}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Data de publicação
                  </span>
                  <input
                    name="published_at"
                    type="date"
                    defaultValue={agreement.published_at ?? ""}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Referência da publicação
                </span>
                <input
                  name="publication_reference"
                  defaultValue={agreement.publication_reference ?? ""}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Diário Oficial, edição, data ou link"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Link do documento
                </span>
                <input
                  name="document_url"
                  defaultValue={agreement.document_url ?? ""}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Link do acordo assinado/publicado"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  PDF assinado
                </span>
                <input
                  name="document_file"
                  type="file"
                  accept="application/pdf"
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none transition file:mr-2 file:rounded-md file:border-0 file:bg-teal-50 file:px-2 file:py-1 file:text-[11px] file:font-bold file:text-teal-800 hover:file:bg-teal-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Observações
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={agreement.notes ?? ""}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                href="/coordenadoria/acordos-cooperacao"
                className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Salvar acordo
              </button>
            </div>
          </form>
        </div>
      </section>
    </SystemShell>
  );
}
