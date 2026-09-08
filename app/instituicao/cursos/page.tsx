import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";
import { createOwnCourse, toggleOwnCourseStatus, updateOwnCourse } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type InstituicaoCursosPageProps = {
  searchParams?: Promise<{
    sucesso?: string;
  }>;
};

function courseLevelLabel(level: string | null) {
  const labels: Record<string, string> = {
    superior: "Superior",
    tecnico: "Técnico",
    medio: "Médio",
    outro: "Outro",
  };

  return level ? labels[level] ?? level : "Não informado";
}

function formatWorkload(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${new Intl.NumberFormat("pt-BR").format(value)}h`;
}

export default async function InstituicaoCursosPage({
  searchParams,
}: InstituicaoCursosPageProps) {
  const params = await searchParams;
  const { institution, courses, error } = await getInstitutionAreaData();

  const activeCourses = courses.filter((course) => course.is_active).length;
  const inactiveCourses = courses.length - activeCourses;

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Cursos da Instituição"
      description="Cursos informados pela instituição para compatibilidade com campos de estágio."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para o painel da instituição
        </Link>

        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
          {institution?.name ?? "Instituição não identificada"}
        </span>
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!institution ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="text-base font-black text-amber-950">
            Cadastro institucional pendente
          </h2>
          <p className="mt-1 text-sm text-amber-900">
            Antes de cadastrar cursos, preencha os dados institucionais.
          </p>
          <Link
            href="/instituicao/cadastro"
            className="mt-4 inline-flex rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-950"
          >
            Preencher cadastro institucional
          </Link>
        </section>
      ) : (
        <>
          {params?.sucesso && (
            <section className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
              {params.sucesso === "1" && "Curso cadastrado com sucesso."}
              {params.sucesso === "2" && "Curso atualizado com sucesso."}
              {params.sucesso === "3" && "Situação do curso alterada com sucesso."}
            </section>
          )}

          <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 border-b border-slate-200 md:grid-cols-3">
              <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Cadastrados
                </p>
                <p className="mt-1 text-xl font-black text-slate-950">
                  {courses.length}
                </p>
              </div>

              <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Ativos
                </p>
                <p className="mt-1 text-xl font-black text-teal-700">
                  {activeCourses}
                </p>
              </div>

              <div className="px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Inativos
                </p>
                <p className="mt-1 text-xl font-black text-slate-700">
                  {inactiveCourses}
                </p>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Novo curso
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Cadastre somente cursos que poderão participar do fluxo de estágio.
              </p>
            </div>

            <form
              action={createOwnCourse}
              className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_180px_160px_auto]"
            >
              <input type="hidden" name="institution_id" value={institution.id} />

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Nome do curso
                </span>
                <input
                  name="name"
                  required
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: Direito"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">Nível</span>
                <select
                  name="level"
                  defaultValue="superior"
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="superior">Superior</option>
                  <option value="tecnico">Técnico</option>
                  <option value="medio">Médio</option>
                  <option value="outro">Outro</option>
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-600">
                  Carga horária
                </span>
                <input
                  name="workload_required"
                  type="number"
                  min="0"
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: 300"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-teal-700 px-4 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Cursos informados
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Lista de cursos vinculados à instituição.
              </p>
            </div>

            {courses.length === 0 ? (
              <div className="p-5 text-sm font-semibold text-slate-600">
                Nenhum curso cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-black">Curso</th>
                      <th className="px-4 py-2 font-black">Nível</th>
                      <th className="px-4 py-2 font-black">Carga horária</th>
                      <th className="px-4 py-2 font-black">Situação</th>
                      <th className="px-4 py-2 text-right font-black">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 align-top">
                          <p className="font-black text-slate-950">
                            {course.name}
                          </p>
                        </td>

                        <td className="px-4 py-2 align-top font-semibold text-slate-700">
                          {courseLevelLabel(course.level)}
                        </td>

                        <td className="px-4 py-2 align-top text-slate-700">
                          {formatWorkload(course.workload_required)}
                        </td>

                        <td className="px-4 py-2 align-top">
                          <span
                            className={
                              course.is_active
                                ? "inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200"
                                : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200"
                            }
                          >
                            {course.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td className="px-4 py-2 align-top">
                          <div className="flex justify-end gap-2">
                            <details className="relative">
                              <summary className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800">
                                Editar
                              </summary>

                              <div className="absolute right-0 z-20 mt-2 w-[520px] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
                                <form action={updateOwnCourse} className="grid gap-3">
                                  <input type="hidden" name="id" value={course.id} />

                                  <label className="grid gap-1">
                                    <span className="text-xs font-bold text-slate-600">
                                      Nome do curso
                                    </span>
                                    <input
                                      name="name"
                                      required
                                      defaultValue={course.name}
                                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                    />
                                  </label>

                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="grid gap-1">
                                      <span className="text-xs font-bold text-slate-600">
                                        Nível
                                      </span>
                                      <select
                                        name="level"
                                        defaultValue={course.level ?? "superior"}
                                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                      >
                                        <option value="superior">Superior</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="medio">Médio</option>
                                        <option value="outro">Outro</option>
                                      </select>
                                    </label>

                                    <label className="grid gap-1">
                                      <span className="text-xs font-bold text-slate-600">
                                        Carga horária
                                      </span>
                                      <input
                                        name="workload_required"
                                        type="number"
                                        min="0"
                                        defaultValue={course.workload_required ?? ""}
                                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                                      />
                                    </label>
                                  </div>

                                  <div className="flex justify-end">
                                    <button
                                      type="submit"
                                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-teal-800"
                                    >
                                      Salvar edição
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </details>

                            <form action={toggleOwnCourseStatus}>
                              <input type="hidden" name="id" value={course.id} />
                              <input
                                type="hidden"
                                name="next_status"
                                value={course.is_active ? "inativo" : "ativo"}
                              />

                              <button
                                type="submit"
                                className={
                                  course.is_active
                                    ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                                    : "rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-100"
                                }
                              >
                                {course.is_active ? "Inativar" : "Ativar"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              Os cursos informados serão utilizados nas sondagens, acordos e apresentação de estudantes.
            </div>
          </section>
        </>
      )}
    </SystemShell>
  );
}
