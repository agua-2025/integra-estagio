import { PanelCard } from "@/components/system/PanelCard";
import { SystemHeader } from "@/components/system/SystemHeader";

const actions = [
  {
    title: "Analisar sondagens",
    description:
      "Receba consultas de instituições e encaminhe às unidades municipais para manifestação sobre disponibilidade de campo.",
  },
  {
    title: "Consolidar viabilidade",
    description:
      "Organize as respostas das unidades e informe se há possibilidade total, parcial ou inexistente para o estágio solicitado.",
  },
  {
    title: "Acordos de Cooperação",
    description:
      "Analise pedidos, gere minutas, acompanhe assinaturas, registre publicações e controle a vigência dos acordos.",
  },
  {
    title: "Validar documentos",
    description:
      "Confira carta de apresentação, termo de compromisso, seguro e demais documentos individuais dos estudantes.",
  },
  {
    title: "Autorizar início",
    description:
      "Libere o início do estágio somente após validação completa da documentação, campo, supervisor e unidade.",
  },
  {
    title: "Relatórios e auditoria",
    description:
      "Acompanhe estágios em andamento, pendências, encerramentos e histórico das movimentações.",
  },
];

export default function CoordenadoriaAreaPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SystemHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Área da Coordenadoria
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Controle central do fluxo de estágio curricular supervisionado.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            A Coordenadoria será responsável por analisar documentos, encaminhar
            solicitações às unidades, controlar acordos, validar processos
            individuais e autorizar o início dos estágios.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((item) => (
            <PanelCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
