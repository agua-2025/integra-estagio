import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";
import { createOwnCourse } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function courseLevelLabel(level: string | null) {
  const labels: Record<string, string> = {
    superior: "Superior",
    tecnico: "Técnico",
    medio: "Médio",
    outro: "Outro",
  };

  return level ? labels[level] ?? level : "Não informado";
}

export default async function InstituicaoCursosPage() {
  const { institution, courses, error } = await getInstitutionAreaData();

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Cursos da Instituição"
      description="Informe os cursos ofertados pela instituição para análise de compatibilidade com campos de estágio."
    >
      <div className="mb-6">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para o painel da instituição
        </Link>
      </div>

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {!institution ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Cadastro institucional pendente.
          </h2>
          <p className="mt-3 text-sm leading-6 text-amber-900">
            Antes de cadastrar cursos, preencha os dados institucionais.
          </p>
          <Link
            href="/instituicao/cadastro"
            className="mt-5 inline-flex rounded-xl bg-amber-900 px-5 py-3 text-sm font-bold text-white hover:bg-amber-950"
          >
            Preencher cadastro institucional
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.85fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Novo curso
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre os cursos que poderão participar do fluxo de estágio.
            </p>

            <form action={createOwnCourse} className="mt-5 grid gap-4">
              <input type="hidden" name="institution_id" value={institution.id} />

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nome do curso
                </span>
                <input
                  name="name"
                  required
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="Ex.: Direito"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Nível
                  </span>
                  <select
                    name="level"
                    defaultValue="superior"
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="superior">Superior</option>
                    <option value="tecnico">Técnico</option>
                    <option value="medio">Médio</option>
                    <option value="outro">Outro</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Carga horária
                  </span>
                  <input
                    name="workload_required"
                    type="number"
                    min="0"
                    className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    placeholder="Ex.: 300"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Cadastrar curso
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-950">
                Cursos informados
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Cursos vinculados à instituição.
              </p>
            </div>

            {courses.length === 0 ? (
              <div className="p-5 text-sm font-semibold text-slate-600">
                Nenhum curso cadastrado.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-950">{course.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {courseLevelLabel(course.level)}
                        {course.workload_required !== null
                          ? ` • ${course.workload_required}h`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={
                        course.is_active
                          ? "w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                          : "w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                      }
                    >
                      {course.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </SystemShell>
  );
}
