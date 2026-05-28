import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function InstituicoesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Instituições de ensino
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            O primeiro passo é consultar a disponibilidade de campo de estágio.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            A instituição de ensino consulta se há campo compatível nos órgãos e
            unidades municipais. Havendo viabilidade, o processo segue para a
            formalização da cooperação e, posteriormente, para a apresentação dos
            estudantes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/acesso"
              className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Acessar sistema
            </Link>
            <Link
              href="/como-funciona"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Ver fluxo completo
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">
            O que a instituição poderá fazer
          </h2>

          <div className="mt-6 space-y-4">
            {[
              "Consultar campo para estágio curricular supervisionado",
              "Acompanhar a análise de viabilidade pelo Município",
              "Solicitar Acordo de Cooperação Técnica",
              "Informar cursos, responsáveis e orientadores",
              "Apresentar estudantes após a cooperação ativa",
              "Encaminhar documentos, seguro e carta de apresentação",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
