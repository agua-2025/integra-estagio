import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Sondagens",
    value: "0",
    description: "Consultas recebidas para análise de campo.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Processos aguardando documento ou manifestação.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos em análise, assinatura ou vigência.",
  },
  {
    label: "Estágios",
    value: "0",
    description: "Estágios autorizados ou em acompanhamento.",
  },
];

const actions = [
  {
    title: "Analisar sondagens",
    description:
      "Receba consultas de instituições e encaminhe às unidades municipais para manifestação sobre disponibilidade de campo.",
    status: "Entrada",
  },
  {
    title: "Consolidar viabilidade",
    description:
      "Organize as respostas das unidades e informe se há possibilidade total, parcial ou inexistente.",
  },
  {
    title: "Controlar Acordos de Cooperação",
    description:
      "Analise pedidos, gere minutas, acompanhe assinaturas, registre publicações e controle vigências.",
  },
  {
    title: "Validar documentos individuais",
    description:
      "Confira carta de apresentação, termo de compromisso, seguro e demais documentos do estudante.",
  },
  {
    title: "Autorizar início",
    description:
      "Libere o início do estágio somente após validação completa da documentação e indicação da unidade.",
  },
  {
    title: "Relatórios e auditoria",
    description:
      "Acompanhe estágios em andamento, pendências, encerramentos e histórico das movimentações.",
  },
];

export default function CoordenadoriaAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Coordenadoria"
      title="Controle central do fluxo"
      description="Ambiente responsável por analisar solicitações, consultar unidades, controlar acordos, validar documentos e autorizar o início dos estágios."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Gestão do processo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe as etapas sob responsabilidade da Coordenadoria.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
