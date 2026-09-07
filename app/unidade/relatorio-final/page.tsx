import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { createUnitFinalReport } from "./actions";
import { getUnitFinalReportsData } from "@/lib/queries/unit-final-reports";

type PageProps = {
  searchParams?: Promise<{
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function closingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    concluido: "Concluído",
    concluido_com_observacao: "Concluído com observação",
    encerrado_antecipadamente: "Encerrado antecipadamente",
    pendente: "Pendente",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "concluido") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "concluido_com_observacao") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "encerrado_antecipadamente") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UnidadeRelatorioFinalPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { unit, internOptions, reports, error } =
    await getUnitFinalReportsData();

  const emAndamento = internOptions.length;
  const finalizados = reports.length;
  const comObservacao = reports.filter(
    (item) => item.closing_status === "concluido_com_observacao",
  ).length;
  const antecipados = reports.filter(
    (item) => item.closing_status === "encerrado_antecipadamente",
  ).length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Relatório Final"
      description="Registre o encerramento do estágio, resumo das atividades, carga horária cumprida e observações da unidade."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Relatório final registrado com sucesso.
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

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Unidade municipal
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {unit?.name ?? "Unidade não identificada"}
        </p>
      </section>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Aptos para encerramento
          </p>
          <p className="text-xl font-black text-slate-950">{emAndamento}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Finalizados
          </p>
          <p className="text-xl font-black text-teal-700">{finalizados}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Com observação
          </p>
          <p className="text-xl font-black text-sky-700">{comObservacao}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Antecipados
          </p>
          <p className="text-xl font-black text-amber-700">{antecipados}</p>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <form
          action={createUnitFinalReport}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Registrar relatório
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            O relatório final encerra o estágio no âmbito da unidade municipal.
          </p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Estagiário</span>
              <select
                name="internship_id"
                required
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecione</option>
                {internOptions.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.student_name} — {intern.course_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Período efetivamente realizado
              </span>
              <input
                name="performed_period"
                required
                placeholder="Ex.: 06/09/2026 a 28/10/2026"
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Carga horária cumprida
              </span>
              <input
                name="completed_workload"
                type="number"
                min="1"
                required
                placeholder="Ex.: 80"
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Situação do encerramento
              </span>
              <select
                name="closing_status"
                required
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecione</option>
                <option value="concluido">Concluído</option>
                <option value="concluido_com_observacao">
                  Concluído com observação
                </option>
                <option value="encerrado_antecipadamente">
                  Encerrado antecipadamente
                </option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Resumo das atividades
              </span>
              <textarea
                name="activities_summary"
                rows={5}
                required
                placeholder="Descreva as atividades desenvolvidas pelo estudante durante o estágio."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">
                Observações do supervisor
              </span>
              <textarea
                name="supervisor_notes"
                rows={4}
                placeholder="Informe observações, recomendações ou ressalvas, se houver."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <button
              type="submit"
              disabled={internOptions.length === 0}
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Registrar relatório final
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Relatórios finais registrados
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Listagem real dos encerramentos registrados pela unidade.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="p-5 text-sm text-slate-600">
              Nenhum relatório final registrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-black">Estagiário</th>
                    <th className="px-3 py-2 font-black">Instituição</th>
                    <th className="px-3 py-2 font-black">Curso</th>
                    <th className="px-3 py-2 font-black">Supervisor</th>
                    <th className="px-3 py-2 font-black">Período</th>
                    <th className="px-3 py-2 font-black">Carga</th>
                    <th className="px-3 py-2 font-black">Situação</th>
                    <th className="px-3 py-2 font-black">Resumo</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 align-top font-black text-slate-950">
                        {report.student_name}
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        {report.institution_name}
                      </td>

                      <td className="px-3 py-2 align-top font-semibold text-slate-800">
                        {report.course_name}
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        {report.supervisor_name}
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        {report.performed_period}
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        {report.completed_workload ?? "-"}h
                      </td>

                      <td className="px-3 py-2 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                            report.closing_status,
                          )}`}
                        >
                          {closingStatusLabel(report.closing_status)}
                        </span>
                      </td>

                      <td className="px-3 py-2 align-top text-slate-700">
                        <details className="max-w-[260px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Ver relatório
                          </summary>
                          <p className="mt-1 leading-5">{report.activities_summary}</p>
                          {report.supervisor_notes && (
                            <p className="mt-2 leading-5">
                              <strong>Observações:</strong>{" "}
                              {report.supervisor_notes}
                            </p>
                          )}
                          <p className="mt-2 text-[10px] text-slate-400">
                            Registrado em {formatDate(report.created_at)}
                          </p>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            Após o relatório final, o estágio passa para situação encerrada.
          </div>
        </section>
      </section>
    </SystemShell>
  );
}
