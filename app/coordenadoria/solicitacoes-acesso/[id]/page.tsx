import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { getAccessRequests } from "@/lib/queries/access-requests";
import {
  releaseInstitutionAccess,
  updateAccessRequestStatus,
} from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AccessRequestAnalysisPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_analise: "Em análise",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada",
    cancelada: "Cancelada",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "aprovada") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "rejeitada" || status === "cancelada") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (status === "em_analise") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function accessLabel(accessReleased: boolean, status: string) {
  if (accessReleased) return "Liberado";
  if (status === "aprovada") return "A liberar";
  return "Não liberado";
}

function accessClass(accessReleased: boolean, status: string) {
  if (accessReleased) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "aprovada") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function formatLocation(city: string | null, state: string | null) {
  if (!city && !state) return "Não informada";
  return `${city ?? ""}${state ? `/${state}` : ""}`;
}

export default async function AccessRequestAnalysisPage({
  params,
}: AccessRequestAnalysisPageProps) {
  const { id } = await params;
  const { requests, error } = await getAccessRequests();

  const request = requests.find((item) => item.id === id);

  if (!request) {
    notFound();
  }

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Análise da Solicitação"
      description="Conferência do pedido de acesso institucional e liberação do usuário inicial."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria/solicitacoes-acesso"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para solicitações
        </Link>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${statusClass(
              request.status,
            )}`}
          >
            {statusLabel(request.status)}
          </span>

          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${accessClass(
              request.access_released,
              request.status,
            )}`}
          >
            {accessLabel(request.access_released, request.status)}
          </span>
        </div>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Não foi possível carregar a solicitação: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Dados do pedido
          </h2>
          <p className="text-xs text-slate-500">
            A aprovação libera apenas a criação do usuário institucional. O cadastro completo será validado depois.
          </p>
        </div>

        <div className="grid gap-3 p-3 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="w-40 bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Instituição
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {request.institution_name}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    CNPJ
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.institution_cnpj ?? "Não informado"}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Responsável
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.requester_name}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    E-mail
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.requester_email}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Telefone
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.requester_phone ?? "Não informado"}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Cidade/UF
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {formatLocation(request.city, request.state)}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Observações
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.notes ?? "Sem observações."}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Análise
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.review_notes ?? "Sem análise registrada."}
                  </td>
                </tr>
                <tr>
                  <td className="bg-slate-50 px-3 py-2 font-bold text-slate-600">
                    Liberação
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {request.access_release_notes ?? "Sem observação de liberação."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-3">
            <form
              action={updateAccessRequestStatus}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <input type="hidden" name="id" value={request.id} />

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Situação da análise
                </span>
                <select
                  name="status"
                  defaultValue={request.status}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em análise</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="rejeitada">Rejeitada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </label>

              <label className="mt-2 grid gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Observação da análise
                </span>
                <textarea
                  name="review_notes"
                  rows={3}
                  defaultValue={request.review_notes ?? ""}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Registre observações da Coordenadoria."
                />
              </label>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/coordenadoria/solicitacoes-acesso"
                  className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                >
                  Salvar análise
                </button>
              </div>
            </form>

            {request.status === "aprovada" && !request.access_released && (
              <form
                action={releaseInstitutionAccess}
                className="rounded-lg border border-teal-200 bg-teal-50 p-3"
              >
                <input type="hidden" name="id" value={request.id} />

                <p className="text-xs font-black uppercase tracking-wide text-teal-900">
                  Liberar acesso
                </p>
                <p className="mt-1 text-[11px] leading-4 text-teal-800">
                  Cria o usuário institucional. Depois a instituição completa o cadastro.
                </p>

                <label className="mt-2 grid gap-1">
                  <span className="text-[11px] font-semibold text-teal-900">
                    Senha provisória
                  </span>
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    className="h-8 rounded-lg border border-teal-200 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Mínimo 8 caracteres"
                  />
                </label>

                <label className="mt-2 grid gap-1">
                  <span className="text-[11px] font-semibold text-teal-900">
                    Observação da liberação
                  </span>
                  <textarea
                    name="access_release_notes"
                    rows={2}
                    className="rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Ex.: usuário criado e liberado."
                  />
                </label>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                >
                  Criar usuário
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SystemShell>
  );
}
