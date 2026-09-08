import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionStudentsData } from "@/lib/queries/institution-students";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    curso?: string;
    unidade?: string;
    estudante?: string;
    relatorio?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string | null) {
  if (!status) {
    return "Aguardando";
  }

  const labels: Record<string, string> = {
    rascunho: "Rascunho",
    apresentado: "Apresentado",
    em_analise: "Em análise",
    pendente_correcao: "Pendente de correção",
    documentos_validados: "Documentos validados",
    apto_para_autorizacao: "Pronto para emissão",
    autorizado: "Autorizado",
    indeferido: "Indeferido",
    cancelado: "Cancelado",
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string | null) {
  if (["autorizado", "em_andamento"].includes(status ?? "")) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (
    status === "apto_para_autorizacao" ||
    status === "documentos_validados" ||
    status === "aguardando_inicio"
  ) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (
    status === "apresentado" ||
    status === "em_analise" ||
    status === "pendente_correcao" ||
    !status
  ) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function reportLabel(status: string | null) {
  const labels: Record<string, string> = {
    concluido: "Concluído",
    concluido_com_observacao: "Com observação",
    encerrado_antecipadamente: "Antecipado",
  };

  return status ? labels[status] ?? status : "Pendente";
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

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

function hasFilters(params: Awaited<PageProps["searchParams"]>) {
  return Boolean(
    params?.status ||
      params?.curso ||
      params?.unidade ||
      params?.estudante ||
      params?.relatorio,
  );
}

export default async function InstituicaoEstudantesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const { institution, students, courses, units, error } =
    await getInstitutionStudentsData({
      status: params?.status,
      courseId: params?.curso,
      unitId: params?.unidade,
      student: params?.estudante,
      report: params?.relatorio,
    });

  const filtered = hasFilters(params);
  const total = students.length;
  const emAnalise = students.filter((item) =>
    ["apresentado", "em_analise", "pendente_correcao"].includes(
      item.presentation_status,
    ),
  ).length;
  const autorizados = students.filter(
    (item) => item.authorization_status === "autorizado",
  ).length;
  const emAndamento = students.filter(
    (item) => item.internship_status === "em_andamento",
  ).length;

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Estudantes"
      description="Acompanhe estudantes apresentados, autorizações e histórico de estágio."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/apresentar-estudante"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
        >
          Apresentar estudante
        </Link>
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 border-b border-slate-200 lg:grid-cols-[1.4fr_2fr]">
          <div className="border-b border-slate-200 px-4 py-3 lg:border-b-0 lg:border-r">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Instituição
            </p>
            <p className="mt-1 text-base font-black text-slate-950">
              {institution?.name ?? "Instituição não identificada"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
            <div className="border-r border-slate-100 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Exibidos
              </p>
              <p className="text-lg font-black text-slate-950">{total}</p>
            </div>

            <div className="border-r border-slate-100 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Em análise
              </p>
              <p className="text-lg font-black text-amber-700">{emAnalise}</p>
            </div>

            <div className="border-r border-slate-100 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Autorizados
              </p>
              <p className="text-lg font-black text-teal-700">{autorizados}</p>
            </div>

            <div className="px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Em andamento
              </p>
              <p className="text-lg font-black text-sky-700">{emAndamento}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Filtros de consulta
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Localize por situação, curso, unidade, relatório ou nome.
              </p>
            </div>

            {filtered && (
              <Link
                href="/instituicao/estudantes"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-[190px_220px_220px_190px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                <option value="em_analise">Em análise</option>
                <option value="pronto">Prontos</option>
                <option value="autorizado">Autorizados</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrado">Encerrados</option>
                <option value="indeferido_cancelado">Indeferidos/cancelados</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Curso</span>
              <select
                name="curso"
                defaultValue={params?.curso ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
              <span className="text-xs font-bold text-slate-600">Relatório</span>
              <select
                name="relatorio"
                defaultValue={params?.relatorio ?? ""}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="registrado">Registrado</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Estudante</span>
              <input
                name="estudante"
                defaultValue={params?.estudante ?? ""}
                placeholder="Buscar por nome"
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-9 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
              >
                Filtrar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Estudantes apresentados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Consulta limitada aos 200 registros mais recentes conforme os filtros aplicados.
          </p>
        </div>

        {students.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estudante encontrado para os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Período</th>
                  <th className="px-3 py-2 font-black">Carga</th>
                  <th className="px-3 py-2 font-black">Análise</th>
                  <th className="px-3 py-2 font-black">Autorização</th>
                  <th className="px-3 py-2 font-black">Estágio</th>
                  <th className="px-3 py-2 font-black">Relatório</th>
                  <th className="px-3 py-2 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top">
                      <p className="font-black text-slate-950">
                        {student.student_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {student.student_email ?? "E-mail não informado"}
                      </p>
                      {student.student_cpf && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          CPF: {student.student_cpf}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {student.course_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {student.municipal_unit_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <p>{student.intended_period ?? "-"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {student.intended_schedule ?? "-"}
                      </p>
                    </td>

                    <td className="px-3 py-2 align-top font-bold text-slate-800">
                      {formatNumber(student.required_workload)}h
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.presentation_status,
                        )}`}
                      >
                        {statusLabel(student.presentation_status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.authorization_status,
                        )}`}
                      >
                        {statusLabel(student.authorization_status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.internship_status,
                        )}`}
                      >
                        {statusLabel(student.internship_status)}
                      </span>
                      {student.authorized_start_date && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatDate(student.authorized_start_date)} a{" "}
                          {formatDate(student.authorized_end_date)}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          student.final_report_status ? "autorizado" : null,
                        )}`}
                      >
                        {reportLabel(student.final_report_status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <div className="flex justify-end">
                        {student.internship_id ? (
                          <Link
                            href={`/instituicao/estudantes/${student.internship_id}`}
                            className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                          >
                            Ver histórico
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Aguardando
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A instituição acompanha o fluxo do estudante, da apresentação ao encerramento do estágio.
        </div>
      </section>
    </SystemShell>
  );
}
