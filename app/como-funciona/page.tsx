import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const steps = [
  {
    title: "Consulta de campo",
    text: "A instituição de ensino informa o curso, a quantidade estimada de estudantes, a carga horária e o período pretendido.",
  },
  {
    title: "Análise pelas unidades",
    text: "A Coordenadoria encaminha a solicitação aos órgãos municipais para verificar se há campo compatível.",
  },
  {
    title: "Viabilidade",
    text: "Havendo possibilidade, a instituição é orientada a formalizar o Acordo de Cooperação Técnica.",
  },
  {
    title: "Formalização",
    text: "O acordo é analisado, assinado, publicado e ativado no sistema.",
  },
  {
    title: "Documentos individuais",
    text: "Depois da cooperação ativa, são organizados os documentos do estudante, como carta de apresentação, seguro e termo de compromisso.",
  },
  {
    title: "Início autorizado",
    text: "O estágio começa somente após validação final da documentação e indicação do campo de estágio.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Como funciona
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Um fluxo simples para organizar o estágio curricular supervisionado.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            O Integra Estágio começa pela consulta de campo, passa pela análise
            das unidades municipais e somente depois segue para a formalização
            da cooperação e dos documentos individuais do estudante.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-sm font-bold text-teal-700">
                Etapa {index + 1}
              </span>
              <h2 className="mt-3 text-xl font-bold text-slate-950">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
