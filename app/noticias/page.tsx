import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const posts = [
  {
    title: "Integra Estágio inicia estruturação do portal público",
    date: "Em breve",
    description:
      "O portal reunirá orientações, documentos, notícias e acesso ao sistema de gestão dos estágios curriculares supervisionados.",
  },
  {
    title: "Área de documentos será padronizada",
    date: "Em breve",
    description:
      "Modelos de acordo, termo, carta de apresentação e relatórios serão organizados para facilitar o fluxo entre instituições e Município.",
  },
  {
    title: "Campos de estágio serão consultados digitalmente",
    date: "Em breve",
    description:
      "As instituições poderão consultar a viabilidade de campo antes da formalização da cooperação institucional.",
  },
];

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Notícias e avisos
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Atualizações do Integra Estágio.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Esta área será utilizada para comunicados, orientações, novas
            instituições cooperadas, campos de estágio e atualização de
            documentos.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {item.date}
              </span>
              <h2 className="mt-3 text-xl font-bold text-slate-950">
                {item.title}
              </h2>
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
