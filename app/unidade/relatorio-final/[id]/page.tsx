import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createUnitFinalReport } from "../actions";
import { getUnitFinalReportDetail } from "@/lib/queries/unit-final-reports";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
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

function internshipStatusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
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

function defaultPeriod(startDate: string, endDate: string | null) {
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

export default async function UnidadeRelatorioFinalDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const { detail, error } = await getUnitFinalReportDetail(id);

  if (!detail && !error) {
    notFound();
  }

  const canCreateReport =
    detail &&
    !detail.report &&
    ["em_andamento", "suspenso"].includes(detail.status);

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Relatório Final do Estágio"
      description="Registre ou consulte o relatório final vinculado ao estágio selecionado."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade/relatorio-final"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para relatórios finais
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {query?.erro && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(query.erro)}
        </section>
      )}

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {detail && (
        <>
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Estudante
                </p>
                <p className="mt-1 text-base font-black text-slate-950">
                  {detail.student_name}
                </p>
                {detail.student_email && (
                  <p className="text-xs text-slate-500">{detail.student_email}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Instituição / Curso
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {detail.institution_name}
                </p>
                <p className="text-xs text-slate-500">{detail.course_name}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Supervisor
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {detail.supervisor_name}
                </p>
                <p className="text-xs text-slate-500">
                  {detail.schedule ?? "Horário não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Situação do estágio
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {internshipStatusLabel(detail.status)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(detail.start_date)} a {formatDate(detail.end_date)}
                </p>
              </div>
            </div>
          </section>

          {detail.report ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                    Relatório registrado
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Este estágio já possui relatório final.
                  </p>
                </div>

                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800 ring-1 ring-teal-200">
                  {closingStatusLabel(detail.report.closing_status)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Período realizado
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {detail.report.performed_period}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Carga cumprida
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {detail.report.completed_workload ?? "-"}h
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Resumo das atividades
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {detail.report.activities_summary}
                </p>
              </div>

              {detail.report.supervisor_notes && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Observações do supervisor
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {detail.report.supervisor_notes}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <form
              action={createUnitFinalReport}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="internship_id" value={detail.id} />

              <div className="mb-4">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                  Registrar relatório final
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  O relatório final encerrará este estágio no âmbito da unidade municipal.
                </p>
              </div>

              {!canCreateReport && (
                <section className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Este estágio não está disponível para registro de relatório final.
                </section>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Período efetivamente realizado
                  </span>
                  <input
                    name="performed_period"
                    required
                    defaultValue={defaultPeriod(detail.start_date, detail.end_date)}
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

                <label className="grid gap-1 md:col-span-2">
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

                <label className="grid gap-1 md:col-span-2">
                  <span className="text-xs font-bold text-slate-600">
                    Resumo das atividades
                  </span>
                  <textarea
                    name="activities_summary"
                    rows={6}
                    required
                    placeholder="Descreva as atividades desenvolvidas pelo estudante durante o estágio."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1 md:col-span-2">
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
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={!canCreateReport}
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Registrar relatório final
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </SystemShell>
  );
}
