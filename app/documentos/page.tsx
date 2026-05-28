import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const documents = [
  {
    title: "Acordo de Cooperação Técnica",
    description:
      "Documento institucional firmado entre o Município e a instituição de ensino para permitir a realização de estágio curricular supervisionado nos órgãos municipais.",
  },
  {
    title: "Termo de Compromisso de Estágio",
    description:
      "Documento individual que formaliza as condições do estágio entre estudante, instituição de ensino e Município.",
  },
  {
    title: "Carta de Apresentação",
    description:
      "Documento emitido pela instituição de ensino para apresentar formalmente o estudante ao Município.",
  },
  {
    title: "Plano de Atividades",
    description:
      "Documento que descreve as atividades compatíveis com o curso, o setor de realização, o período e a forma de acompanhamento.",
  },
  {
    title: "Relatório de Atividades",
    description:
      "Registro periódico ou final das atividades desenvolvidas pelo estudante durante o estágio.",
  },
  {
    title: "Termo de Realização do Estágio",
    description:
      "Documento final com indicação do período, carga horária, atividades desenvolvidas e avaliação do estágio.",
  },
];

export default function DocumentosPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Documentos
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Modelos padronizados para organizar todas as etapas.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            O Integra Estágio reunirá os documentos utilizados na consulta,
            formalização, acompanhamento e encerramento dos estágios curriculares
            supervisionados.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
