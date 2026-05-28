import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Consultas",
    value: "0",
    description: "Sondagens de campo enviadas pela instituição.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos de cooperação em análise ou ativos.",
  },
  {
    label: "Estudantes",
    value: "0",
    description: "Estudantes apresentados ao Município.",
  },
];

const actions = [
  {
    title: "Consultar campo de estágio",
    description:
      "Informe curso, quantidade estimada, carga horária e período pretendido para análise de viabilidade.",
    status: "Primeiro passo",
  },
  {
    title: "Acompanhar sondagens",
    description:
      "Veja o andamento das consultas encaminhadas, respostas da Coordenadoria e manifestações das unidades.",
  },
  {
    title: "Solicitar Acordo de Cooperação",
    description:
      "Após viabilidade positiva, formalize o pedido de cooperação institucional com o Município.",
  },
  {
    title: "Apresentar estudantes",
    description:
      "Encaminhe estudantes após a cooperação ativa e acompanhe pendências documentais.",
  },
];

export default function InstituicaoAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Instituição de Ensino"
      title="Consultas, cooperação e estudantes"
      description="Ambiente destinado às instituições de ensino para consultar campos de estágio, formalizar cooperação e acompanhar os estudantes encaminhados."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Próximas ações
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Selecione a ação correspondente à etapa da instituição.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
