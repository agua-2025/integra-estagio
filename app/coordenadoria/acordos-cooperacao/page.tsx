import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Em análise",
    value: "0",
    description: "Pedidos de cooperação aguardando conferência.",
  },
  {
    label: "Aguardando assinatura",
    value: "0",
    description: "Minutas aprovadas e pendentes de assinatura.",
  },
  {
    label: "Ativos",
    value: "0",
    description: "Acordos vigentes e aptos para apresentação de estudantes.",
  },
  {
    label: "Vencidos",
    value: "0",
    description: "Acordos com vigência encerrada ou pendentes de renovação.",
  },
];

const agreements = [
  {
    institution: "Faculdade ou Universidade Exemplo",
    status: "Em análise",
    courses: ["Direito", "Administração", "Pedagogia"],
    validity: "A definir",
    publication: "Pendente",
    description:
      "Pedido de cooperação em fase de validação cadastral, conferência de documentos institucionais e cursos abrangidos.",
  },
  {
    institution: "Instituição Cooperada Exemplo",
    status: "Aguardando assinatura",
    courses: ["Serviço Social", "Enfermagem"],
    validity: "24 meses",
    publication: "Após assinatura",
    description:
      "Minuta visual de exemplo aguardando assinatura das partes e posterior registro de publicação.",
  },
  {
    institution: "Centro de Ensino Exemplo",
    status: "Ativo",
    courses: ["Técnico em Administração", "Técnico em Informática"],
    validity: "01/01/2026 a 31/12/2027",
    publication: "Registrada",
    description:
      "Exemplo de acordo ativo, com vigência controlada e cursos habilitados para encaminhamento de estudantes.",
  },
];

export default function AcordosCooperacaoPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Acordos de Cooperação Técnica"
      description="Controle os pedidos, minutas, assinaturas, publicações, vigências e situação dos acordos firmados com instituições de ensino."
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
          Novo acordo
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
            Acordos cadastrados
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na etapa com banco de dados, a
            Coordenadoria poderá analisar pedidos, gerar minutas, controlar
            assinaturas, registrar publicação, acompanhar vigência e encerrar ou
            renovar acordos.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {agreements.map((agreement) => (
            <article
              key={agreement.institution}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-950">
                  {agreement.institution}
                </h3>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {agreement.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {agreement.description}
              </p>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Vigência
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {agreement.validity}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Publicação
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {agreement.publication}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cursos abrangidos
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {agreement.courses.map((course) => (
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
                  Ver acordo
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Documentos
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Publicação
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Base institucional"
          description="A instituição somente deverá apresentar estudantes após acordo ativo, publicado e dentro da vigência."
          status="Regra"
        />
        <ActionCard
          title="Controle documental"
          description="O processo deverá guardar minuta, acordo assinado, comprovante ou link de publicação e histórico de alterações."
        />
        <ActionCard
          title="Renovação e encerramento"
          description="O sistema deverá permitir controlar acordos próximos do vencimento, encerrados, rescindidos ou renovados."
        />
      </section>
    </SystemShell>
  );
}
