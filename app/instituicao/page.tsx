import { PanelCard } from "@/components/system/PanelCard";
import { SystemHeader } from "@/components/system/SystemHeader";

const actions = [
  {
    title: "Consultar campo de estágio",
    description:
      "Solicite ao Município a análise de disponibilidade de campo para cursos e estudantes da instituição.",
  },
  {
    title: "Acompanhar sondagens",
    description:
      "Veja o andamento das consultas encaminhadas, respostas da Coordenadoria e manifestações das unidades municipais.",
  },
  {
    title: "Acordos de Cooperação",
    description:
      "Solicite, acompanhe e consulte os acordos de cooperação técnica firmados com o Município.",
  },
  {
    title: "Apresentar estudantes",
    description:
      "Encaminhe estudantes após a cooperação ativa e acompanhe pendências documentais.",
  },
];

export default function InstituicaoAreaPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SystemHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Área da Instituição de Ensino
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Consultas, cooperação e apresentação de estudantes.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Este ambiente será utilizado pelas instituições de ensino para iniciar
            sondagens de campo, acompanhar a viabilidade, formalizar cooperação e
            encaminhar estudantes para estágio curricular supervisionado.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
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
