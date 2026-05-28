import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const faqs = [
  {
    question: "O estudante pode solicitar estágio diretamente?",
    answer:
      "O fluxo principal começa pela instituição de ensino, que consulta a disponibilidade de campo e apresenta o estudante ao Município.",
  },
  {
    question: "A instituição precisa ter Acordo de Cooperação?",
    answer:
      "Sim. Havendo viabilidade de campo, a instituição deverá formalizar o Acordo de Cooperação Técnica antes da apresentação dos estudantes.",
  },
  {
    question: "O estágio é remunerado?",
    answer:
      "O Integra Estágio é voltado ao estágio curricular supervisionado obrigatório, sem bolsa e sem auxílio-transporte.",
  },
  {
    question: "O estudante pode iniciar antes dos documentos?",
    answer:
      "Não. O início depende da documentação regular, termo de compromisso, seguro, campo definido e autorização final do Município.",
  },
  {
    question: "Quem acompanha o estudante?",
    answer:
      "O estágio deve ter orientação da instituição de ensino e supervisão da unidade municipal concedente.",
  },
];

export default function PerguntasFrequentesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Perguntas frequentes
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          Dúvidas comuns sobre o Integra Estágio.
        </h1>

        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-950">
                {item.question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
