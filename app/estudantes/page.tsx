import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function EstudantesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Estudantes
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Experiência prática para complementar sua formação.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              O estágio curricular supervisionado permite ao estudante vivenciar
              atividades compatíveis com sua área de formação, com orientação da
              instituição de ensino e supervisão da unidade municipal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/como-funciona"
                className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                Entender o fluxo
              </Link>
              <Link
                href="/acesso"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                Acompanhar solicitação
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Importante
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              O estágio não começa por conta própria.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A solicitação deve ser apresentada pela instituição de ensino, e o
              início das atividades depende da existência de campo compatível,
              documentação regular e autorização final do Município.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Encaminhamento",
              text: "A instituição apresenta o estudante e informa os dados necessários para análise do Município.",
            },
            {
              title: "Documentação",
              text: "O processo envolve documentos como termo de compromisso, seguro e carta de apresentação.",
            },
            {
              title: "Supervisão",
              text: "As atividades são acompanhadas por professor orientador e servidor supervisor da unidade municipal.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
