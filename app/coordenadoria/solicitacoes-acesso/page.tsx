import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getAccessRequests } from "@/lib/queries/access-requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function SolicitacoesAcessoPage() {
  const { requests, error } = await getAccessRequests();

  const pendingCount = requests.filter((item) => item.status === "pendente").length;
  const analysisCount = requests.filter((item) => item.status === "em_analise").length;
  const waitingReleaseCount = requests.filter(
    (item) => item.status === "aprovada" && !item.access_released,
  ).length;
  const releasedCount = requests.filter((item) => item.access_released).length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Solicitações de Acesso"
      description="Analise pedidos de acesso institucional e controle a liberação do usuário da instituição."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/solicitar-acesso"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver página pública
        </Link>
      </div>

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          Não foi possível carregar as solicitações: {error}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid border-b border-slate-200 md:grid-cols-5">
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-lg font-black text-slate-950">{requests.length}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pendentes</p>
            <p className="text-lg font-black text-amber-700">{pendingCount}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Em análise</p>
            <p className="text-lg font-black text-sky-700">{analysisCount}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">A liberar</p>
            <p className="text-lg font-black text-amber-700">{waitingReleaseCount}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Liberados</p>
            <p className="text-lg font-black text-teal-700">{releasedCount}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Pedidos recebidos
          </h2>
          <p className="text-xs text-slate-500">
            A solicitação libera apenas o acesso inicial. O cadastro institucional completo será validado depois pela Coordenadoria.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="p-5 text-sm font-semibold text-slate-600">
            Nenhuma solicitação recebida.
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-[31%] px-2 py-1.5 font-black">Instituição</th>
                  <th className="w-[18%] px-2 py-1.5 font-black">Responsável</th>
                  <th className="w-[25%] px-2 py-1.5 font-black">Contato</th>
                  <th className="w-[9%] px-2 py-1.5 font-black">Análise</th>
                  <th className="w-[9%] px-2 py-1.5 font-black">Acesso</th>
                  <th className="w-[8%] px-2 py-1.5 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="align-top hover:bg-slate-50">
                    <td className="px-2 py-1.5">
                      <p className="font-black text-slate-950">{request.institution_name}</p>
                      {request.institution_cnpj && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          CNPJ: {request.institution_cnpj}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatLocation(request.city, request.state)}
                      </p>
                    </td>

                    <td className="px-2 py-1.5 font-semibold text-slate-800">
                      {request.requester_name}
                    </td>

                    <td className="px-2 py-1.5 text-slate-700">
                      <p className="truncate">{request.requester_email}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {request.requester_phone ?? "Sem telefone"}
                      </p>
                    </td>

                    <td className="px-2 py-1.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(request.status)}`}>
                        {statusLabel(request.status)}
                      </span>
                    </td>

                    <td className="px-2 py-1.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${accessClass(request.access_released, request.status)}`}>
                        {accessLabel(request.access_released, request.status)}
                      </span>
                    </td>

                    <td className="px-2 py-1.5 text-right">
                      <Link
                        href={`/coordenadoria/solicitacoes-acesso/${request.id}`}
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                      >
                        Analisar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          Status da solicitação não é o mesmo que cadastro institucional validado. Após liberar o acesso, a instituição deverá completar dados e cursos para validação da Coordenadoria.
        </div>
      </section>
    </SystemShell>
  );
}
