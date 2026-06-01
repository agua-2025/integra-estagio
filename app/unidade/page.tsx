import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Sondagens",
    value: "0",
    description: "Solicitações aguardando manifestação da unidade.",
  },
  {
    label: "Campos",
    value: "0",
    description: "Campos de estágio informados pela unidade.",
  },
  {
    label: "Estudantes",
    value: "0",
    description: "Estagiários autorizados para acompanhamento.",
  },
];

const actions = [
  {
    title: "Definir campo de estágio",
    description:
      "Indique local, horários, quantidade possível, atividades compatíveis e limitações da unidade.",
  },
  {
    title: "Indicar supervisor",
    description:
      "Informe o servidor responsável pela orientação e acompanhamento do estudante na unidade.",
  },
  {
    title: "Acompanhar estudantes",
    description:
      "Consulte os estágios autorizados e acompanhe o desenvolvimento das atividades na unidade.",
  },
  {
    title: "Registrar ocorrências",
    description:
      "Comunique faltas, ajustes, intercorrências, necessidade de alteração ou encerramento antecipado.",
  },
  {
    title: "Relatório final",
    description:
      "Registre informações para encerramento, atividades desenvolvidas e avaliação resumida.",
  },
];

export default function UnidadeAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Unidade Municipal"
      title="Campo, supervisão e acompanhamento"
      description="Ambiente das unidades municipais para informar disponibilidade, indicar supervisores e acompanhar estudantes autorizados."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Atividades da unidade
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A unidade participa informando viabilidade, supervisor e
            acompanhamento.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/unidade/sondagens"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Responder sondagens
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Prioridade
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Informe se a unidade possui condições de receber estudantes para
              determinado curso e período.
            </p>
          </Link>

          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
