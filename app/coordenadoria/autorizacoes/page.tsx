import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
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
    apto_para_autorizacao: "Pronto para autorização",
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
    rejeitado: "Rejeitado",
  };

  if (!status) return "-";
  return labels[status] ?? status;
}

function statusClass(status: string | null | undefined) {
  if (["autorizado", "validado", "apto_para_autorizacao"].includes(status ?? "")) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
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
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
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
      description="Confira termo, seguro, documentos e vigência antes de liberar o início do estágio."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/estudantes"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Autorização de início registrada com sucesso.
        </section>
      )}

      {params?.erro && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(params.erro)}
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <Metric label="Aptos para autorizar" value={aptos} tone="teal" />
        <Metric label="Bloqueados" value={bloqueados} tone="amber" />
        <Metric label="Autorizações emitidas" value={total} tone="slate" />
        <Metric label="Ativas" value={autorizados} tone="teal" />
      </section>

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Conferência para autorização
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            A autorização só será liberada quando o termo, a apólice, os documentos e a cobertura do seguro estiverem compatíveis.
          </p>
        </div>

        {readyPresentations.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estagiário pendente de autorização no momento.
          </div>
        ) : (
          <div className="grid gap-4 p-4">
            {readyPresentations.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">
                          {item.student_name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
                            item.status,
                          )}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {item.institution_name} · {item.course_name}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl px-3 py-2 text-sm font-black ring-1 ${
                        item.can_authorize
                          ? "bg-teal-50 text-teal-800 ring-teal-200"
                          : "bg-amber-50 text-amber-800 ring-amber-200"
                      }`}
                    >
                      {item.can_authorize ? "Apto para autorizar" : "Bloqueado"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <SmallInfo label="Unidade" value={item.municipal_unit_name} />
                    <SmallInfo
                      label="Supervisor"
                      value={item.term_supervisor_name ?? item.supervisor_name ?? "A definir"}
                    />
                    <SmallInfo
                      label="Período do termo"
                      value={
                        item.internship_start_date && item.internship_end_date
                          ? `${formatDate(item.internship_start_date)} a ${formatDate(
                              item.internship_end_date,
                            )}`
                          : "-"
                      }
                    />
                    <SmallInfo
                      label="Carga horária"
                      value={`${formatNumber(item.term_required_workload ?? item.required_workload)}h`}
                    />
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
                  <div className="p-4">
                    <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                      Checklist de liberação
                    </h4>

                    <div className="grid gap-2 md:grid-cols-2">
                      {item.authorization_requirements.map((requirement) => (
                        <div
                          key={requirement.label}
                          className={`rounded-xl border px-3 py-2 ${
                            requirement.ok
                              ? "border-teal-200 bg-teal-50"
                              : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs font-black uppercase tracking-wide ${
                                requirement.ok ? "text-teal-800" : "text-amber-800"
                              }`}
                            >
                              {requirement.label}
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                requirement.ok
                                  ? "bg-white text-teal-700 ring-1 ring-teal-200"
                                  : "bg-white text-amber-700 ring-1 ring-amber-200"
                              }`}
                            >
                              {requirement.ok ? "OK" : "Pendente"}
                            </span>
                          </div>

                          <p
                            className={`mt-1 text-xs leading-5 ${
                              requirement.ok ? "text-teal-900" : "text-amber-900"
                            }`}
                          >
                            {requirement.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                      <p>
                        <span className="font-bold text-slate-800">Seguro:</span>{" "}
                        {item.insurance_company ?? "não informado"}
                      </p>
                      <p>
                        <span className="font-bold text-slate-800">Apólice:</span>{" "}
                        {item.policy_number ?? "não informada"}
                      </p>
                      <p>
                        <span className="font-bold text-slate-800">Vigência:</span>{" "}
                        {formatDate(item.insurance_valid_from)} a{" "}
                        {formatDate(item.insurance_valid_until)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 p-4 xl:border-l xl:border-t-0">
                    {item.can_authorize ? (
                      <form action={createInternshipAuthorization} className="grid gap-3">
                        <input type="hidden" name="presentation_id" value={item.id} />

                        <label className="grid gap-1">
                          <span className="text-xs font-bold text-slate-600">
                            Supervisor responsável
                          </span>
                          <input
                            name="supervisor_name"
                            required
                            defaultValue={
                              item.term_supervisor_name ?? item.supervisor_name ?? ""
                            }
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="grid gap-1">
                            <span className="text-xs font-bold text-slate-600">
                              Início autorizado
                            </span>
                            <input
                              name="authorized_start_date"
                              type="date"
                              required
                              defaultValue={item.internship_start_date ?? ""}
                              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                            />
                          </label>

                          <label className="grid gap-1">
                            <span className="text-xs font-bold text-slate-600">
                              Término
                            </span>
                            <input
                              name="authorized_end_date"
                              type="date"
                              required
                              defaultValue={item.internship_end_date ?? ""}
                              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                            />
                          </label>
                        </div>

                        <label className="grid gap-1">
                          <span className="text-xs font-bold text-slate-600">
                            Horário autorizado
                          </span>
                          <input
                            name="authorized_schedule"
                            defaultValue={item.internship_schedule ?? item.intended_schedule ?? ""}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs font-bold text-slate-600">
                            Observações
                          </span>
                          <textarea
                            name="notes"
                            rows={3}
                            placeholder="Registre observações da autorização, se necessário."
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                          />
                        </label>

                        <button
                          type="submit"
                          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
                        >
                          Emitir autorização
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                        <p className="font-black">Autorização bloqueada</p>
                        <p className="mt-1">
                          Regularize os itens pendentes no Termo de Compromisso,
                          documentos ou seguro antes de emitir a autorização.
                        </p>

                        <Link
                          href={`/coordenadoria/estudantes/${item.id}/analise`}
                          className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-black text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
                        >
                          Abrir análise do estagiário
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Autorizações emitidas
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Relação das autorizações formais já registradas no sistema.
          </p>
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
                  <th className="px-3 py-2 font-black">Estagiário</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Supervisor</th>
                  <th className="px-3 py-2 font-black">Início</th>
                  <th className="px-3 py-2 font-black">Término</th>
                  <th className="px-3 py-2 font-black">Horário</th>
                  <th className="px-3 py-2 font-black">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {authorizations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-black text-slate-950">
                      {item.student_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {item.institution_name}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
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
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
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

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A autorização de início é o ato formal que libera o estagiário para iniciar as atividades na unidade municipal indicada.
        </div>
      </section>
    </SystemShell>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "amber" | "slate";
}) {
  const valueClass =
    tone === "teal"
      ? "text-teal-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-slate-950";

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`text-xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
