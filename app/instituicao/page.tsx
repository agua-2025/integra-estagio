import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionAreaData } from "@/lib/queries/institution-area";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function institutionStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    em_analise: "Em análise",
    ativa: "Ativa",
    pendente: "Pendente",
    inativa: "Inativa",
    bloqueada: "Bloqueada",
  };

  return status ? labels[status] ?? status : "Sem cadastro";
}

export default async function InstituicaoAreaPage() {
  const { profile, institution, courses, error } = await getInstitutionAreaData();

  const activeCourses = courses.filter((course) => course.is_active);
  const institutionIsActive = institution?.status === "ativa";
  const hasInstitution = Boolean(institution);
  const hasCourses = courses.length > 0;

  const nextAction = !hasInstitution
    ? "Preencha o cadastro institucional."
    : !hasCourses
      ? "Cadastre os cursos da instituição."
      : !institutionIsActive
        ? "Aguarde a validação da Coordenadoria."
        : "A instituição está apta para as próximas etapas.";

  const summaries = [
    {
      label: "Cadastro",
      value: institutionStatusLabel(institution?.status),
      description: "Situação atual do cadastro institucional.",
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
    {
      label: "Próxima ação",
      value: hasInstitution && hasCourses && institutionIsActive ? "Liberada" : "Pendente",
      description: nextAction,
    },
  ];

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Painel da Instituição"
      description="Acompanhe o cadastro institucional, cursos, sondagens e etapas necessárias para participação no fluxo de estágio."
    >
      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {profile?.role !== "instituicao" && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Você está acessando esta área com perfil administrativo. O menu real da
          instituição será exibido para usuários com perfil institucional.
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Módulos da instituição
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete as etapas iniciais antes de solicitar sondagem de campo de
            estágio.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/instituicao/cadastro"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Dados institucionais
              </h3>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Cadastro
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Preencha ou acompanhe os dados da instituição de ensino.
            </p>
          </Link>

          <Link
            href="/instituicao/cursos"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Cursos
              </h3>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Base
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Informe os cursos que poderão participar das etapas de estágio.
            </p>
          </Link>

          <Link
            href="/instituicao/sondagens"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Sondagens
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Em breve
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Solicite sondagem de campo após validação institucional.
            </p>
          </Link>

          <Link
            href="/instituicao/acordos"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Acordos
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Em breve
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Acompanhe acordos de cooperação quando houver viabilidade.
            </p>
          </Link>

          <Link
            href="/instituicao/estudantes"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Estudantes
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Em breve
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Apresente estudantes somente após acordo ativo e vigente.
            </p>
          </Link>

          <ActionCard
            title="Fluxo controlado"
            description="A instituição só avança para sondagem após cadastro e cursos informados, com validação da Coordenadoria."
            status="Regra"
          />
        </div>
      </section>
    </SystemShell>
  );
}
