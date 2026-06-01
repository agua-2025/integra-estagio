import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Instituições",
    value: "0",
    description: "Instituições cadastradas ou em análise.",
  },
  {
    label: "Cursos",
    value: "0",
    description: "Cursos vinculados às instituições.",
  },
  {
    label: "Acordos ativos",
    value: "0",
    description: "Cooperações vigentes para estágio.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Registros aguardando documentação ou validação.",
  },
];

const institutions = [
  {
    name: "Faculdade ou Universidade Exemplo",
    status: "Em análise",
    courses: ["Direito", "Administração", "Pedagogia"],
    description:
      "Instituição em fase de validação cadastral e organização dos cursos para eventual cooperação.",
  },
  {
    name: "Instituição de Ensino Técnico Exemplo",
    status: "Pendente",
    courses: ["Técnico em Administração", "Técnico em Informática"],
    description:
      "Cadastro visual de exemplo para futura análise de documentos, responsáveis e cursos vinculados.",
  },
  {
    name: "Instituição Cooperada Exemplo",
    status: "Cooperação ativa",
    courses: ["Serviço Social", "Enfermagem", "Educação Física"],
    description:
      "Exemplo de instituição com cooperação ativa e cursos habilitados para consulta de campo.",
  },
];

export default function InstituicoesCursosPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Instituições e Cursos"
      description="Organize instituições de ensino, cursos, responsáveis, orientadores e vínculo com acordos de cooperação."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <button
          type="button"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Nova instituição
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Cadastro institucional
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na versão com banco de dados,
            a Coordenadoria poderá cadastrar instituições, vincular cursos,
            controlar responsáveis, documentos, vigência de acordos e situação
            da cooperação.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {institutions.map((institution) => (
            <article
              key={institution.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-950">
                  {institution.name}
                </h3>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {institution.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {institution.description}
              </p>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cursos vinculados
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {institution.courses.map((course) => (
                    <span
                      key={course}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Cursos
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Documentos
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Vínculo com cooperação"
          description="Cada instituição poderá ter um ou mais acordos de cooperação, com controle de vigência, publicação e situação."
          status="Regra"
        />
        <ActionCard
          title="Cursos autorizados"
          description="A instituição somente poderá apresentar estudantes de cursos vinculados e compatíveis com os campos disponíveis."
        />
        <ActionCard
          title="Responsáveis e orientadores"
          description="O cadastro poderá registrar responsáveis institucionais, professores orientadores e contatos oficiais."
        />
      </section>
    </SystemShell>
  );
}
