import Link from "next/link";
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
    ? "Preencher cadastro"
    : !hasCourses
      ? "Cadastrar cursos"
      : !institutionIsActive
        ? "Aguardar validação"
        : "Fluxo liberado";

  const modules = [
    {
      title: "Dados institucionais",
      href: "/instituicao/cadastro",
      tag: "Cadastro",
      description: "Preencha ou acompanhe os dados da instituição.",
    },
    {
      title: "Cursos",
      href: "/instituicao/cursos",
      tag: "Base",
      description: "Informe os cursos que poderão participar do fluxo.",
    },
    {
      title: "Sondagens",
      href: "/instituicao/sondagens",
      tag: "Acompanhar",
      description: "Solicite sondagem e acompanhe a manifestação das unidades.",
    },
    {
      title: "Acordos",
      href: "/instituicao/acordos",
      tag: "Consultar",
      description: "Consulte acordos de cooperação vinculados à instituição.",
    },
    {
      title: "Estudantes",
      href: "/instituicao/estudantes",
      tag: "Acompanhar",
      description: "Apresente estudantes e acompanhe autorização, estágio e relatório.",
    },
  ];

  return (
    <SystemShell
      areaLabel="Área da Instituição"
      title="Painel da Instituição"
      description="Acompanhe cadastro, cursos, sondagens, acordos e estudantes."
    >
      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {profile?.role !== "instituicao" && (
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Você está acessando esta área com perfil administrativo. O menu real da
          instituição será exibido para usuários com perfil institucional.
        </section>
      )}

      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-4">
          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Cadastro
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {institutionStatusLabel(institution?.status)}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Cursos
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {courses.length}
            </p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Cursos ativos
            </p>
            <p className="mt-1 text-xl font-black text-teal-700">
              {activeCourses.length}
            </p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Próxima ação
            </p>
            <p className="mt-1 text-xl font-black text-slate-950">
              {nextAction}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
          {hasInstitution && hasCourses && institutionIsActive
            ? "A instituição está apta para utilizar os módulos operacionais."
            : "Complete as etapas pendentes para avançar no fluxo de estágio."}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Módulos da instituição
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Acesse rapidamente as etapas do fluxo institucional.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-black">Módulo</th>
                <th className="px-4 py-2 font-black">Finalidade</th>
                <th className="px-4 py-2 font-black">Tipo</th>
                <th className="px-4 py-2 text-right font-black">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => (
                <tr key={module.href} className="hover:bg-slate-50">
                  <td className="px-4 py-2 align-top">
                    <p className="font-black text-slate-950">{module.title}</p>
                  </td>

                  <td className="px-4 py-2 align-top text-slate-700">
                    {module.description}
                  </td>

                  <td className="px-4 py-2 align-top">
                    <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                      {module.tag}
                    </span>
                  </td>

                  <td className="px-4 py-2 align-top">
                    <div className="flex justify-end">
                      <Link
                        href={module.href}
                        className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                      >
                        Acessar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          A instituição acompanha o fluxo do cadastro inicial até o encerramento dos estágios.
        </div>
      </section>
    </SystemShell>
  );
}
