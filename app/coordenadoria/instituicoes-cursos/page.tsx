import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionsAndCourses } from "@/lib/queries/institutions-courses";
import {
  createCourse,
  createInstitution,
  toggleCourseStatus,
  updateInstitutionStatus,
} from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function institutionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    em_analise: "Em análise",
    ativa: "Ativa",
    pendente: "Pendente",
    inativa: "Inativa",
    bloqueada: "Bloqueada",
  };

  return labels[status] ?? status;
}

function institutionStatusClass(status: string) {
  if (status === "ativa") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "bloqueada" || status === "inativa") {
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }

  if (status === "pendente") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
}

function courseLevelLabel(level: string | null) {
  const labels: Record<string, string> = {
    superior: "Superior",
    tecnico: "Técnico",
    medio: "Médio",
    outro: "Outro",
  };

  return level ? labels[level] ?? level : "Não informado";
}

export default async function CoordenadoriaInstituicoesCursosPage() {
  const { institutions, courses, error } = await getInstitutionsAndCourses();

  const activeInstitutions = institutions.filter(
    (institution) => institution.status === "ativa",
  );

  const activeCourses = courses.filter((course) => course.is_active);

  const coursesByInstitution = new Map<string, typeof courses>();

  for (const course of courses) {
    const current = coursesByInstitution.get(course.institution_id) ?? [];
    current.push(course);
    coursesByInstitution.set(course.institution_id, current);
  }

  const summaries = [
    {
      label: "Instituições",
      value: String(institutions.length),
      description: "Instituições de ensino cadastradas.",
    },
    {
      label: "Ativas",
      value: String(activeInstitutions.length),
      description: "Instituições aptas para vinculações.",
    },
    {
      label: "Cursos",
      value: String(courses.length),
      description: "Cursos cadastrados no sistema.",
    },
    {
      label: "Cursos ativos",
      value: String(activeCourses.length),
      description: "Cursos disponíveis para vincular aos campos.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Instituições e Cursos"
      description="Cadastre instituições de ensino e cursos que poderão participar do fluxo de estágio."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/campos-estagio"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver campos de estágio
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      {error && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Não foi possível carregar instituições e cursos: {error}
        </section>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Nova instituição
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre a instituição de ensino antes de vincular cursos,
              sondagens e acordos.
            </p>
          </div>

          <form action={createInstitution} className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Nome da instituição
              </span>
              <input
                name="name"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Faculdade Católica Rainha da Paz"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">CNPJ</span>
              <input
                name="cnpj"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="00.000.000/0000-00"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                name="status"
                defaultValue="ativa"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="ativa">Ativa</option>
                <option value="em_analise">Em análise</option>
                <option value="pendente">Pendente</option>
                <option value="inativa">Inativa</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Cidade
              </span>
              <input
                name="city"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ex.: Araputanga"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">UF</span>
              <input
                name="state"
                maxLength={2}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="MT"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                E-mail
              </span>
              <input
                name="email"
                type="email"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="instituicao@exemplo.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Telefone
              </span>
              <input
                name="phone"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="(65) 0000-0000"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Observações
              </span>
              <textarea
                name="notes"
                rows={3}
                className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Informações úteis sobre a instituição, contato ou situação cadastral."
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Cadastrar instituição
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Novo curso
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre cursos vinculados à instituição. Depois eles serão
              associados aos campos de estágio compatíveis.
            </p>
          </div>

          <form action={createCourse} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Instituição
              </span>
              <select
                name="institution_id"
                required
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecione</option>
                {activeInstitutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </label>

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
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Instituições cadastradas
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Listagem compacta das instituições e respectivos cursos.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {institutions.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">
                  Nenhuma instituição cadastrada.
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Cadastre uma instituição para iniciar o vínculo com cursos e
                  futuros acordos.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Instituição</th>
                    <th className="px-5 py-4 font-bold">Contato</th>
                    <th className="px-5 py-4 font-bold">Cursos</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-right font-bold">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {institutions.map((institution) => {
                    const institutionCourses =
                      coursesByInstitution.get(institution.id) ?? [];

                    return (
                      <tr key={institution.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-950">
                            {institution.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {institution.city || "Cidade não informada"}
                            {institution.state ? `/${institution.state}` : ""}
                          </p>
                          {institution.cnpj && (
                            <p className="mt-1 text-xs text-slate-500">
                              CNPJ: {institution.cnpj}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          <div className="grid gap-1">
                            <span>{institution.email ?? "Sem e-mail"}</span>
                            <span className="text-xs text-slate-500">
                              {institution.phone ?? "Sem telefone"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {institutionCourses.length === 0 ? (
                            <span className="text-sm text-slate-500">
                              Nenhum curso cadastrado
                            </span>
                          ) : (
                            <div className="flex max-w-md flex-wrap gap-1.5">
                              {institutionCourses.map((course) => (
                                <span
                                  key={course.id}
                                  className={
                                    course.is_active
                                      ? "rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200"
                                      : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                  }
                                >
                                  {course.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${institutionStatusClass(
                              institution.status,
                            )}`}
                          >
                            {institutionStatusLabel(institution.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {institution.status !== "ativa" && (
                              <form action={updateInstitutionStatus}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={institution.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="ativa"
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                                >
                                  Ativar
                                </button>
                              </form>
                            )}

                            {institution.status !== "inativa" && (
                              <form action={updateInstitutionStatus}>
                                <input
                                  type="hidden"
                                  name="id"
                                  value={institution.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="inativa"
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Inativar
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Cursos cadastrados
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Controle rápido dos cursos disponíveis para vínculo aos campos de
            estágio.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {courses.length === 0 ? (
            <div className="p-6 text-sm font-semibold text-slate-600">
              Nenhum curso cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Curso</th>
                    <th className="px-5 py-4 font-bold">Instituição</th>
                    <th className="px-5 py-4 font-bold">Nível</th>
                    <th className="px-5 py-4 font-bold">Carga horária</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 text-right font-bold">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => {
                    const institution = institutions.find(
                      (item) => item.id === course.institution_id,
                    );

                    return (
                      <tr key={course.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4 font-bold text-slate-950">
                          {course.name}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {institution?.name ?? "Instituição não encontrada"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {courseLevelLabel(course.level)}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {course.workload_required !== null
                            ? `${course.workload_required}h`
                            : "Não informada"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              course.is_active
                                ? "inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200"
                                : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                            }
                          >
                            {course.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <form action={toggleCourseStatus}>
                              <input type="hidden" name="id" value={course.id} />
                              <input
                                type="hidden"
                                name="is_active"
                                value={String(course.is_active)}
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                              >
                                {course.is_active ? "Inativar" : "Ativar"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Base para sondagens"
          description="Instituições ativas poderão consultar campos e solicitar sondagem de campo de estágio."
          status="Regra"
        />
        <ActionCard
          title="Cursos compatíveis"
          description="Depois vamos vincular cursos aos campos de estágio para controlar a compatibilidade."
        />
        <ActionCard
          title="Acordo posterior"
          description="A apresentação de estudantes só ocorrerá após sondagem viável e acordo de cooperação ativo."
        />
      </section>
    </SystemShell>
  );
}
