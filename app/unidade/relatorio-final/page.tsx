import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitFinalReportsData } from "@/lib/queries/unit-final-reports";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    curso?: string;
    estudante?: string;
    sucesso?: string;
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function closingStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    concluido: "Concluído",
    concluido_com_observacao: "Concluído com observação",
    encerrado_antecipadamente: "Encerrado antecipadamente",
    pendente: "Pendente",
    cancelado: "Cancelado",
  };

  return status ? labels[status] ?? status : "Pendente";
}

function statusClass(status: string | null) {
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
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function hasFilters(params: Awaited<PageProps["searchParams"]>) {
  return Boolean(params?.status || params?.curso || params?.estudante);
}

export default async function UnidadeRelatorioFinalPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const { unit, rows, courses, error } = await getUnitFinalReportsData({
    status: params?.status,
    courseId: params?.curso,
    student: params?.estudante,
  });

  const filtered = hasFilters(params);
  const exibidos = rows.length;
  const pendentes = rows.filter((item) => !item.has_report).length;
  const finalizados = rows.filter((item) => item.has_report).length;
  const comObservacao = rows.filter(
    (item) => item.closing_status === "concluido_com_observacao",
  ).length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Relatórios finais"
      description="Registre e consulte o encerramento dos estágios da unidade."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {params?.sucesso === "1" && (
        <section className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
          Relatório final registrado com sucesso.
        </section>
      )}

      {params?.erro && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(params.erro)}
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
              Unidade
            </p>
            <p className="text-sm font-black text-slate-950">
              {unit?.name ?? "Unidade não identificada"}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Exibidos
            </p>
            <p className="text-lg font-black text-slate-950">{exibidos}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Pendentes
            </p>
            <p className="text-lg font-black text-amber-700">{pendentes}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Finalizados
            </p>
            <p className="text-lg font-black text-teal-700">{finalizados}</p>
          </div>

          <div className="px-4 py-2">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Com observação
            </p>
            <p className="text-lg font-black text-sky-700">{comObservacao}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Estágios e relatórios finais
              </h2>
              <p className="text-xs text-slate-500">
                Filtre o estágio antes de registrar ou consultar o relatório final.
              </p>
            </div>

            {filtered && (
              <Link
                href="/unidade/relatorio-final"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-[190px_240px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente de relatório</option>
                <option value="finalizado">Relatório registrado</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Curso</span>
              <select
                name="curso"
                defaultValue={params?.curso ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
              <span className="text-xs font-bold text-slate-600">Estudante</span>
              <input
                name="estudante"
                defaultValue={params?.estudante ?? ""}
                placeholder="Nome do estudante"
                className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
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

        {rows.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estágio encontrado para os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Supervisor</th>
                  <th className="px-3 py-2 font-black">Período</th>
                  <th className="px-3 py-2 font-black">Estágio</th>
                  <th className="px-3 py-2 font-black">Relatório</th>
                  <th className="px-3 py-2 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">{row.student_name}</p>
                      {row.student_email && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.student_email}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {row.institution_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {row.course_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {row.supervisor_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(row.start_date)} a {formatDate(row.end_date)}
                      {row.schedule && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.schedule}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {internshipStatusLabel(row.internship_status)}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          row.closing_status,
                        )}`}
                      >
                        {closingStatusLabel(row.closing_status)}
                      </span>
                      {row.completed_workload !== null && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {row.completed_workload}h
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <div className="flex justify-end">
                        <Link
                          href={`/unidade/relatorio-final/${row.id}`}
                          className={
                            row.has_report
                              ? "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                              : "rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                          }
                        >
                          {row.has_report ? "Ver relatório" : "Registrar"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          O relatório final é registrado em página individual do estágio, evitando formulários extensos nesta listagem.
        </div>
      </section>
    </SystemShell>
  );
}
