import Link from "next/link";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getAccessRequests } from "@/lib/queries/access-requests";
import {
  releaseInstitutionAccess,
  updateAccessRequestStatus,
} from "./actions";

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

export default async function SolicitacoesAcessoPage() {
  const { requests, error } = await getAccessRequests();

  const pendingCount = requests.filter((item) => item.status === "pendente").length;
  const approvedCount = requests.filter((item) => item.status === "aprovada").length;
  const releasedCount = requests.filter((item) => item.access_released).length;
  const waitingReleaseCount = requests.filter(
    (item) => item.status === "aprovada" && !item.access_released,
  ).length;

  const summaries = [
    {
      label: "Total",
      value: String(requests.length),
      description: "Solicitações registradas.",
    },
    {
      label: "Pendentes",
      value: String(pendingCount),
      description: "Aguardando análise.",
    },
    {
      label: "Aprovadas",
      value: String(approvedCount),
      description: "Solicitações deferidas.",
    },
    {
      label: "Acesso pendente",
      value: String(waitingReleaseCount),
      description: "Aprovadas, mas ainda sem liberação registrada.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Solicitações de Acesso"
      description="Analise pedidos de acesso institucional e controle a liberação do usuário da instituição."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/solicitar-acesso"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver página pública
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Como liberar o acesso institucional
        </h2>

        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm leading-6 text-slate-600">
          <li>Analise a solicitação e marque como aprovada, se estiver correta.</li>
          <li>Marque a solicitação como aprovada, se estiver correta.</li>
          <li>Use o botão de liberação para criar o usuário institucional.</li>
          <li>Informe uma senha provisória e oriente a instituição a alterar depois.</li>
          <li>A instituição acessará o sistema para preencher dados e cursos.</li>
        </ol>
      </section>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar as solicitações: {error}
        </section>
      )}

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Pedidos recebidos
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A aprovação autoriza a liberação do usuário institucional. A
            instituição somente avança para sondagem depois de completar dados,
            cursos e validação da Coordenadoria.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {requests.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhuma solicitação recebida.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  As solicitações enviadas pela página pública aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
                <article key={request.id} className="p-5">
                  <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {request.institution_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            request.status,
                          )}`}
                        >
                          {statusLabel(request.status)}
                        </span>

                        <span
                          className={
                            request.access_released
                              ? "rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                          }
                        >
                          {request.access_released
                            ? "Acesso liberado"
                            : "Acesso não liberado"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-1 text-sm leading-6 text-slate-600">
                        <p>
                          <strong>Responsável:</strong> {request.requester_name}
                        </p>
                        <p>
                          <strong>E-mail:</strong> {request.requester_email}
                        </p>
                        <p>
                          <strong>Telefone:</strong>{" "}
                          {request.requester_phone ?? "Não informado"}
                        </p>
                        <p>
                          <strong>Cidade/UF:</strong>{" "}
                          {request.city ?? "Não informada"}
                          {request.state ? `/${request.state}` : ""}
                        </p>
                        {request.institution_cnpj && (
                          <p>
                            <strong>CNPJ:</strong> {request.institution_cnpj}
                          </p>
                        )}
                        {request.notes && (
                          <p>
                            <strong>Observações:</strong> {request.notes}
                          </p>
                        )}
                        {request.review_notes && (
                          <p>
                            <strong>Análise:</strong> {request.review_notes}
                          </p>
                        )}
                        {request.access_release_notes && (
                          <p>
                            <strong>Liberação:</strong>{" "}
                            {request.access_release_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <form
                        action={updateAccessRequestStatus}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <input type="hidden" name="id" value={request.id} />

                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Situação
                          </span>
                          <select
                            name="status"
                            defaultValue={request.status}
                            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_analise">Em análise</option>
                            <option value="aprovada">Aprovada</option>
                            <option value="rejeitada">Rejeitada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </label>

                        <label className="mt-3 grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Observação da análise
                          </span>
                          <textarea
                            name="review_notes"
                            rows={3}
                            defaultValue={request.review_notes ?? ""}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                            placeholder="Registre observações da Coordenadoria."
                          />
                        </label>

                        <button
                          type="submit"
                          className="mt-3 w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                        >
                          Salvar análise
                        </button>
                      </form>

                      {request.status === "aprovada" && !request.access_released && (
                        <form
                          action={releaseInstitutionAccess}
                          className="rounded-2xl border border-teal-200 bg-teal-50 p-4"
                        >
                          <input type="hidden" name="id" value={request.id} />

                          <p className="text-sm font-bold text-teal-950">
                            Liberar acesso institucional
                          </p>
                          <p className="mt-1 text-xs leading-5 text-teal-800">
                            Informe uma senha provisória. O sistema criará o usuário Auth e o profile com role instituicao.
                          </p>

                          <label className="mt-3 grid gap-2">
                            <span className="text-sm font-semibold text-teal-900">
                              Senha provisória
                            </span>
                            <input
                              name="password"
                              type="password"
                              minLength={8}
                              required
                              className="h-11 rounded-xl border border-teal-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                              placeholder="Mínimo 8 caracteres"
                            />
                          </label>

                          <label className="mt-3 grid gap-2">
                            <span className="text-sm font-semibold text-teal-900">
                              Observação da liberação
                            </span>
                            <textarea
                              name="access_release_notes"
                              rows={3}
                              className="rounded-xl border border-teal-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                              placeholder="Ex.: Usuário criado no Supabase Auth e profile institucional liberado."
                            />
                          </label>

                          <button
                            type="submit"
                            className="mt-3 w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                          >
                            Criar usuário e liberar acesso
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SystemShell>
  );
}


