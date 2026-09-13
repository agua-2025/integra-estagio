import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInternsData } from "@/lib/queries/unit-interns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "em_andamento") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "aguardando_inicio") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "encerrado") {
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }

  if (["suspenso", "cancelado"].includes(status)) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
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

type UnidadeEstagiariosPageProps = {
  searchParams?: Promise<{
    status?: string;
    instituicao?: string;
    curso?: string;
    estudante?: string;
  }>;
};

export default async function UnidadeEstagiariosPage({
  searchParams,
}: UnidadeEstagiariosPageProps) {
  const params = await searchParams;

  const { unit, interns, institutions, courses, error } = await getUnitInternsData({
    status: params?.status,
    institution: params?.instituicao,
    course: params?.curso,
    student: params?.estudante,
  });

  const hasFilters = Boolean(
    params?.status || params?.instituicao || params?.curso || params?.estudante,
  );

  const aguardandoInicio = interns.filter(
    (item) => item.status === "aguardando_inicio",
  ).length;

  const emAndamento = interns.filter(
    (item) => item.status === "em_andamento",
  ).length;

  const suspensos = interns.filter((item) => item.status === "suspenso").length;
  const encerrados = interns.filter((item) => item.status === "encerrado").length;

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Estagiários da unidade"
      description="Acompanhe os estágios vinculados à unidade municipal, com acesso ao histórico individual de cada estudante."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/unidade/ocorrencias"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ocorrências
          </Link>

          <Link
            href="/unidade/relatorio-final"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Relatórios finais
          </Link>
        </div>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <div className="mb-3 grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-4">
        <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            Unidade
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            {unit?.name ?? "Unidade não identificada"}
          </p>
          {unit?.responsible_name && (
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              Resp.: {unit.responsible_name}
            </p>
          )}
        </div>
        <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            Aguardando início
          </p>
          <p className="text-xl font-black text-sky-700">{aguardandoInicio}</p>
        </div>

        <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            Em andamento
          </p>
          <p className="text-xl font-black text-teal-700">{emAndamento}</p>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            Suspensos / encerrados
          </p>
          <p className="text-xl font-black text-slate-950">
            {suspensos + encerrados}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Estágios vinculados
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Filtre os estágios da unidade e acesse o histórico individual.
              </p>
            </div>

            {hasFilters && (
              <Link
                href="/unidade/estagiarios"
                className="text-xs font-black uppercase tracking-wide text-teal-700 hover:text-teal-900"
              >
                Limpar filtros
              </Link>
            )}
          </div>

          <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-[190px_220px_220px_1fr_auto]">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Situação</span>
              <select
                name="status"
                defaultValue={params?.status ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                <option value="aguardando_inicio">Aguardando início</option>
                <option value="em_andamento">Em andamento</option>
                <option value="suspenso">Suspenso</option>
                <option value="encerrado">Encerrado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">Instituição</span>
              <select
                name="instituicao"
                defaultValue={params?.instituicao ?? ""}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
                placeholder="Nome, e-mail, curso ou instituição"
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

        {interns.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhum estágio vinculado para esta unidade até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5 font-black">Estudante</th>
                  <th className="px-3 py-1.5 font-black">Instituição</th>
                  <th className="px-3 py-1.5 font-black">Curso</th>
                  <th className="px-3 py-1.5 font-black">Supervisor</th>
                  <th className="px-3 py-1.5 font-black">Início</th>
                  <th className="px-3 py-1.5 font-black">Término</th>
                  <th className="px-3 py-1.5 font-black">Horário</th>
                  <th className="px-3 py-1.5 font-black">Status</th>
                  <th className="px-3 py-1.5 font-black">Observações</th>
                  <th className="px-3 py-1.5 text-right font-black">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 align-top">
                      <p className="font-black text-slate-950">
                        {intern.student_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {intern.student_email ?? "E-mail não informado"}
                      </p>
                    </td>

                    <td className="px-3 py-1.5 align-top text-slate-700">
                      {intern.institution_name}
                    </td>

                    <td className="px-3 py-1.5 align-top font-semibold text-slate-800">
                      {intern.course_name}
                    </td>

                    <td className="px-3 py-1.5 align-top font-semibold text-slate-700">
                      {intern.supervisor_name}
                    </td>

                    <td className="px-3 py-1.5 align-top text-slate-700">
                      {formatDate(intern.authorized_start_date)}
                    </td>

                    <td className="px-3 py-1.5 align-top text-slate-700">
                      {formatDate(intern.authorized_end_date)}
                    </td>

                    <td className="px-3 py-1.5 align-top text-slate-700">
                      {intern.authorized_schedule ?? "-"}
                    </td>

                    <td className="px-3 py-1.5 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          intern.status,
                        )}`}
                      >
                        {statusLabel(intern.status)}
                      </span>
                    </td>

                    <td className="px-3 py-1.5 align-top text-slate-700">
                      {intern.notes ? (
                        <details className="max-w-[220px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Ver observação
                          </summary>
                          <p className="mt-1 leading-5">{intern.notes}</p>
                        </details>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-3 py-1.5 align-top">
                      <div className="flex justify-end">
                        <Link
                          href={`/unidade/estagiarios/${intern.id}`}
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                        >
                          Ver histórico
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          O acompanhamento detalhado ficará concentrado no histórico individual do estágio.
        </div>
      </section>
    </SystemShell>
  );
}
