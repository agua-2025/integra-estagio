import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Campos ativos",
    value: "0",
    description: "Campos publicados para consulta pelas instituições.",
  },
  {
    label: "Em análise",
    value: "0",
    description: "Áreas ainda em avaliação pela Coordenadoria.",
  },
  {
    label: "Indisponíveis",
    value: "0",
    description: "Campos temporariamente suspensos ou inativos.",
  },
];

const fields = [
  {
    title: "Administração e Gestão Pública",
    unit: "Diversas unidades administrativas",
    status: "Ativo",
    description:
      "Rotinas administrativas, atendimento, documentos, controles internos e apoio institucional.",
  },
  {
    title: "Assistência Social",
    unit: "Secretaria Municipal de Assistência Social",
    status: "Conforme disponibilidade",
    description:
      "Campo sujeito à avaliação da secretaria, compatibilidade do curso e capacidade de supervisão.",
  },
  {
    title: "Saúde",
    unit: "Unidades municipais de saúde",
    status: "Em análise",
    description:
      "Campo dependente de critérios técnicos, normas específicas, perfil do curso e capacidade local.",
  },
  {
    title: "Educação",
    unit: "Unidades escolares municipais",
    status: "Conforme calendário",
    description:
      "Possibilidade conforme calendário escolar, orientação pedagógica e capacidade de acompanhamento.",
  },
  {
    title: "Tecnologia e CPD",
    unit: "Setor de Tecnologia da Informação",
    status: "Ativo",
    description:
      "Apoio em rotinas de tecnologia, suporte, sistemas, equipamentos e organização de processos digitais.",
  },
  {
    title: "Jurídico e Apoio Legislativo",
    unit: "Unidades jurídicas ou administrativas compatíveis",
    status: "Em análise",
    description:
      "Campo sujeito à compatibilidade do curso, natureza das atividades e possibilidade de supervisão adequada.",
  },
];

export default function CamposEstagioCoordenadoriaPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Campos de Estágio"
      description="Configure as áreas, unidades, cursos compatíveis, situação e disponibilidade dos campos de estágio curricular supervisionado."
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
          Novo campo de estágio
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Catálogo configurável
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são apenas exemplos visuais. Na etapa com banco de
            dados, a Coordenadoria poderá criar, editar, publicar, suspender ou
            inativar campos conforme a realidade de cada unidade municipal.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <article
              key={field.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-950">
                  {field.title}
                </h3>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {field.status}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                {field.unit}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {field.description}
              </p>

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
                  Publicação
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Cursos
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Controle de publicação"
          description="Somente campos marcados como públicos deverão aparecer na página pública e nas consultas das instituições."
          status="Regra"
        />
        <ActionCard
          title="Capacidade variável"
          description="A quantidade de vagas poderá mudar conforme unidade, turno, supervisor disponível e período solicitado."
        />
        <ActionCard
          title="Histórico de alterações"
          description="Na versão com banco, cada alteração importante poderá ser registrada para fins de controle e auditoria."
        />
      </section>
    </SystemShell>
  );
}
