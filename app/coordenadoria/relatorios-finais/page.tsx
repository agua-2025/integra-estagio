import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationFinalReportsData } from "@/lib/queries/coordination-final-reports";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    instituicao?: string;
    curso?: string;
    unidade?: string;
    data_inicial?: string;
    data_final?: string;
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

function hasFilters(params: Awaited<PageProps["searchParams"]>) {
  return Boolean(
    params?.status ||
      params?.instituicao ||
      params?.curso ||
      params?.unidade ||
      params?.data_inicial ||
      params?.data_final,
  );
}

export default async function CoordenadoriaRelatoriosFinaisPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const { reports, institutions, courses, units, error } =
    await getCoordinationFinalReportsData({
      status: params?.status,
      institutionId: params?.instituicao,
      courseId: params?.curso,
      unitId: params?.unidade,
      dateFrom: params?.data_inicial,
      dateTo: params?.data_final,
    });

  const exibidos = reports.length;
  const concluidos = reports.filter((item) => item.closing_status === "concluido").length;
  const comObservacao = reports.filter(
    (item) => item.closing_status === "concluido_com_observacao",
  ).length;
  const antecipados = reports.filter(
    (item) => item.closing_status === "encerrado_antecipadamente",
  ).length;
  const filtered = hasFilters(params);

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Relatórios finais"
      description="Acompanhe os relatórios finais registrados pelas unidades municipais no encerramento dos estágios."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/coordenadoria/estudantes"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver estudantes
          </Link>

          <Link
            href="/coordenadoria/ocorrencias"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver ocorrências
          </Link>
        </div>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
              Filtros de consulta
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Use filtros para consultar relatórios finais por situação, vínculo e período.
            </p>
          </div>

          {filtered && (
            <Link
              href="/coordenadoria/relatorios-finais"
              className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
            >
              Limpar filtros
            </Link>
          )}
        </div>

        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Situação</span>
            <select
              name="status"
              defaultValue={params?.status ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Todas</option>
              <option value="concluido">Concluído</option>
              <option value="concluido_com_observacao">Concluído com observação</option>
              <option value="encerrado_antecipadamente">Encerrado antecipadamente</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Instituição</span>
            <select
              name="instituicao"
              defaultValue={params?.instituicao ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Todas</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Curso</span>
            <select
              name="curso"
              defaultValue={params?.curso ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Todos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Unidade</span>
            <select
              name="unidade"
              defaultValue={params?.unidade ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            >
              <option value="">Todas</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Data inicial</span>
            <input
              name="data_inicial"
              type="date"
              defaultValue={params?.data_inicial ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-bold text-slate-600">Data final</span>
            <input
              name="data_final"
              type="date"
              defaultValue={params?.data_final ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <div className="flex items-end xl:col-span-6">
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
            >
              Filtrar relatórios
            </button>
          </div>
        </form>
      </section>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Exibidos
          </p>
          <p className="text-xl font-black text-slate-950">{exibidos}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Concluídos
          </p>
          <p className="text-xl font-black text-teal-700">{concluidos}</p>
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Relatórios finais registrados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Consulta limitada aos 200 registros mais recentes conforme os filtros aplicados.
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum relatório final encontrado para os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Supervisor</th>
                  <th className="px-3 py-2 font-black">Período</th>
                  <th className="px-3 py-2 font-black">Carga</th>
                  <th className="px-3 py-2 font-black">Situação</th>
                  <th className="px-3 py-2 font-black">Relatório</th>
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
                      {report.municipal_unit_name}
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
                      <details className="max-w-[280px] text-[11px] text-slate-500">
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
          Esta tela é uma visão gerencial. O histórico individual do estudante será organizado em página própria.
        </div>
      </section>
    </SystemShell>
  );
}
