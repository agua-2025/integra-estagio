import { PanelCard } from "@/components/system/PanelCard";
import { SystemHeader } from "@/components/system/SystemHeader";

const actions = [
  {
    title: "Responder sondagens",
    description:
      "Informe se a unidade possui condições de receber estudantes para determinado curso e período.",
  },
  {
    title: "Definir campo de estágio",
    description:
      "Indique local, horários, quantidade possível, atividades compatíveis e limitações da unidade.",
  },
  {
    title: "Indicar supervisor",
    description:
      "Informe o servidor responsável pela orientação e acompanhamento do estudante na unidade municipal.",
  },
  {
    title: "Acompanhar estudantes",
    description:
      "Consulte os estágios autorizados na unidade e acompanhe o desenvolvimento das atividades.",
  },
  {
    title: "Registrar ocorrências",
    description:
      "Comunique faltas, ajustes, intercorrências, necessidade de alteração ou encerramento antecipado.",
  },
  {
    title: "Relatório final",
    description:
      "Registre informações para encerramento do estágio, atividades desenvolvidas e avaliação resumida.",
  },
];

export default function UnidadeAreaPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SystemHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Área da Unidade Municipal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Disponibilidade, supervisão e acompanhamento dos estudantes.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            As unidades municipais informarão se possuem campo de estágio,
            indicarão supervisores e acompanharão os estudantes autorizados
            durante a vivência prática.
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
