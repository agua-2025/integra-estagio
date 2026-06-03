import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";
import {
  createOwnCourse,
  createOwnInstitution,
  updateOwnInstitution,
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

function courseLevelLabel(level: string | null) {
  const labels: Record<string, string> = {
    superior: "Superior",
    tecnico: "Técnico",
    medio: "Médio",
    outro: "Outro",
  };

  return level ? labels[level] ?? level : "Não informado";
}

export default async function InstituicaoAreaPage() {
  const { profile, institution, courses, error } = await getInstitutionAreaData();

  const activeCourses = courses.filter((course) => course.is_active);

  const summaries = [
    {
      label: "Situação",
      value: institution
        ? institutionStatusLabel(institution.status)
        : "Sem cadastro",
      description: "Status atual do cadastro institucional.",
    },
    {
      label: "Cursos",
      value: String(courses.length),
      description: "Cursos informados pela instituição.",
    },
    {
      label: "Cursos ativos",
      value: String(activeCourses.length),
      description: "Cursos disponíveis para análise.",
    },
  ];

  const canEditInstitution =
    institution?.status === "em_analise" || institution?.status === "pendente";

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Cadastro institucional e cursos"
      description="Preencha os dados da instituição de ensino e informe os cursos que poderão participar do fluxo de estágio."
    >
      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {profile?.role !== "instituicao" && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Você está acessando esta página com perfil administrativo. O fluxo de
          autoinscrição será utilizado por usuários com perfil de instituição.
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      {!institution ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Solicitar cadastro institucional
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Informe os dados da instituição. O cadastro será encaminhado para
              análise da Coordenadoria antes da liberação das próximas etapas.
            </p>
          </div>

          <form action={createOwnInstitution} className="grid gap-4 lg:grid-cols-2">
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
                E-mail institucional
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
                placeholder="Informe dados úteis para análise da Coordenadoria."
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                Enviar cadastro para análise
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Dados institucionais
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enquanto o cadastro estiver em análise ou pendente, a instituição
                poderá revisar os dados informados. Após ativação, alterações
                sensíveis deverão ser avaliadas pela Coordenadoria.
              </p>
            </div>

            <form
              action={updateOwnInstitution}
              className="grid gap-4 lg:grid-cols-2"
            >
              <input type="hidden" name="id" value={institution.id} />

              <label className="grid gap-2 lg:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nome da instituição
                </span>
                <input
                  name="name"
                  required
                  disabled={!canEditInstitution}
                  defaultValue={institution.name}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  CNPJ
                </span>
                <input
                  name="cnpj"
                  disabled={!canEditInstitution}
                  defaultValue={institution.cnpj ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Cidade
                </span>
                <input
                  name="city"
                  disabled={!canEditInstitution}
                  defaultValue={institution.city ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">UF</span>
                <input
                  name="state"
                  maxLength={2}
                  disabled={!canEditInstitution}
                  defaultValue={institution.state ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm uppercase outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  E-mail
                </span>
                <input
                  name="email"
                  type="email"
                  disabled={!canEditInstitution}
                  defaultValue={institution.email ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Telefone
                </span>
                <input
                  name="phone"
                  disabled={!canEditInstitution}
                  defaultValue={institution.phone ?? ""}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-2 lg:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Observações
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  disabled={!canEditInstitution}
                  defaultValue={institution.notes ?? ""}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>

              {canEditInstitution && (
                <div className="lg:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                  >
                    Atualizar dados
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Novo curso
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Informe os cursos ofertados pela instituição para futura
                  análise de compatibilidade com os campos de estágio.
                </p>
              </div>

              <form action={createOwnCourse} className="grid gap-4">
                <input
                  type="hidden"
                  name="institution_id"
                  value={institution.id}
                />

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
                        <p className="font-bold text-slate-950">
                          {course.name}
                        </p>
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
        </>
      )}

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Cadastro em análise"
          description="A instituição informa seus dados e aguarda validação da Coordenadoria."
          status="Fluxo"
        />
        <ActionCard
          title="Cursos informados"
          description="Os cursos cadastrados serão usados depois para verificar compatibilidade com os campos."
        />
        <ActionCard
          title="Próxima etapa"
          description="Após validação, a instituição poderá solicitar sondagem de campo de estágio."
        />
      </section>
    </SystemShell>
  );
}
