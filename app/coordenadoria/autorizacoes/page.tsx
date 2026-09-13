import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { ConfirmSubmitButton } from "@/components/system/ConfirmSubmitButton";
import { createInternshipAuthorization } from "./actions";
import { getCoordinationAuthorizationsData } from "@/lib/queries/coordination-authorizations";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Apto para emissão da autorização",
    aguardando_unidade: "Aguardando unidade",
    aguardando_supervisor: "Aguardando supervisor",
    pronto_para_autorizar: "Pronto para autorizar",
    autorizado: "Autorizado",
    suspenso: "Suspenso",
    cancelado: "Cancelado",
    encerrado: "Encerrado",
    validado: "Validado",
    enviado: "Enviado",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    apto_para_assinatura: "Apto para assinatura",
    termo_assinado_anexado: "Termo assinado anexado",
    rejeitado: "Rejeitado",
  };

  if (!status) return "-";
  return labels[status] ?? status;
}

function statusClass(status: string | null | undefined) {
  if (["autorizado", "validado", "apto_para_autorizacao"].includes(status ?? "")) {
    return "bg-teal-50 text-teal-700 ring-1 ring-teal-200";
  }

  if (
    [
      "documentos_validados",
      "pronto_para_autorizar",
      "enviado",
      "em_analise",
      "pendente_correcao",
      "aguardando_unidade",
      "aguardando_supervisor",
    ].includes(status ?? "")
  ) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (["suspenso", "cancelado", "encerrado", "rejeitado"].includes(status ?? "")) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function CoordenadoriaAutorizacoesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { readyPresentations, authorizations, error } =
    await getCoordinationAuthorizationsData();

  const aptos = readyPresentations.filter((item) => item.can_authorize).length;
  const bloqueados = readyPresentations.filter((item) => !item.can_authorize).length;
  const autorizados = authorizations.filter((item) => item.status === "autorizado").length;
  const total = authorizations.length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Autorizações de início"
      description="Emissão da autorização formal com base no Termo de Compromisso validado."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/estudantes"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
          Autorização de início registrada com sucesso.
        </section>
      )}

      {params?.erro && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {decodeURIComponent(params.erro)}
        </section>
      )}

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {error}
        </section>
      )}

      <section className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
        <span className="font-semibold text-slate-800">Resumo:</span>{" "}
        {aptos} apto(s), {bloqueados} bloqueado(s), {total} autorização(ões) emitida(s), {autorizados} ativa(s).
      </section>

      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Pendentes de autorização
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Os dados da autorização são importados do Termo de Compromisso validado.
          </p>
        </div>

        {readyPresentations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estagiário pendente de autorização no momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {readyPresentations.map((item) => (
              <article key={item.id} className="p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {item.student_name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.institution_name} · {item.course_name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(
                        item.status,
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        item.can_authorize
                          ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      }`}
                    >
                      {item.can_authorize ? "Apto" : "Bloqueado"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="min-w-0">
                    <table className="w-full border-collapse text-left text-xs">
                      <tbody className="divide-y divide-slate-100 border-y border-slate-100">
                        <InfoRow label="Unidade" value={item.municipal_unit_name} />
                        <InfoRow
                          label="Supervisor"
                          value={item.term_supervisor_name ?? item.supervisor_name ?? "-"}
                        />
                        <InfoRow
                          label="Período"
                          value={
                            item.internship_start_date && item.internship_end_date
                              ? `${formatDate(item.internship_start_date)} a ${formatDate(
                                  item.internship_end_date,
                                )}`
                              : "-"
                          }
                        />
                        <InfoRow
                          label="Horário"
                          value={item.internship_schedule ?? item.intended_schedule ?? "-"}
                        />
                        <InfoRow
                          label="Carga horária"
                          value={`${formatNumber(
                            item.term_required_workload ?? item.required_workload,
                          )}h`}
                        />
                        <InfoRow
                          label="Seguro"
                          value={`${item.insurance_company ?? "-"} · apólice ${
                            item.policy_number ?? "-"
                          } · ${formatDate(item.insurance_valid_from)} a ${formatDate(
                            item.insurance_valid_until,
                          )}`}
                        />
                      </tbody>
                    </table>

                    <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Checklist de liberação
                      </summary>

                      <table className="mt-2 w-full border-collapse text-left text-xs">
                        <tbody className="divide-y divide-slate-200">
                          {item.authorization_requirements.map((requirement) => (
                            <tr key={requirement.label}>
                              <td className="w-48 px-2 py-1.5 font-medium text-slate-700">
                                {requirement.label}
                              </td>
                              <td className="w-20 px-2 py-1.5">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                    requirement.ok
                                      ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                  }`}
                                >
                                  {requirement.ok ? "OK" : "Pendente"}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-slate-500">
                                {requirement.detail}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {item.can_authorize ? (
                      <form action={createInternshipAuthorization} className="grid gap-3">
                        <input type="hidden" name="presentation_id" value={item.id} />

                        <p className="text-xs leading-5 text-slate-600">
                          A autorização será emitida com os dados já validados no Termo de Compromisso.
                          Se houver divergência, devolva o termo para correção na análise do estagiário.
                        </p>

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-slate-600">
                            Observações
                          </span>
                          <textarea
                            name="notes"
                            rows={3}
                            placeholder="Observações da autorização, se necessário."
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </label>

                        <ConfirmSubmitButton
                          message="Atenção: a emissão da autorização liberará formalmente o início do estágio com base no Termo de Compromisso validado. Confirma a emissão?"
                          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                        >
                          Emitir autorização
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <div className="text-sm leading-6 text-amber-800">
                        <p className="font-semibold">Autorização bloqueada.</p>
                        <p className="mt-1 text-xs">
                          Regularize as pendências antes da emissão.
                        </p>

                        <Link
                          href={`/coordenadoria/estudantes/${item.id}/analise`}
                          className="mt-3 inline-flex rounded-md border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
                        >
                          Abrir análise
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Autorizações emitidas
          </h2>
        </div>

        {authorizations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhuma autorização emitida até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Estagiário</th>
                  <th className="px-3 py-2 font-semibold">Instituição</th>
                  <th className="px-3 py-2 font-semibold">Curso</th>
                  <th className="px-3 py-2 font-semibold">Unidade</th>
                  <th className="px-3 py-2 font-semibold">Supervisor</th>
                  <th className="px-3 py-2 font-semibold">Início</th>
                  <th className="px-3 py-2 font-semibold">Término</th>
                  <th className="px-3 py-2 font-semibold">Horário</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {authorizations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.student_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.institution_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.course_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.municipal_unit_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.supervisor_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(item.authorized_start_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(item.authorized_end_date)}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.authorized_schedule ?? "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          A autorização de início é o ato formal que libera o estagiário para iniciar as atividades na unidade municipal indicada.
        </div>
      </section>
    </SystemShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-40 bg-slate-50 px-3 py-2 align-top text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </th>
      <td className="px-3 py-2 align-top text-xs text-slate-800">
        {value}
      </td>
    </tr>
  );
}
