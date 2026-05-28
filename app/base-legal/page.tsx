import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const legalItems = [
  "Lei Federal nº 11.788/2008",
  "Lei Municipal nº 1.409/2017",
  "Acordo de Cooperação Técnica",
  "Termo de Compromisso de Estágio",
  "Normas e orientações complementares",
];

export default function BaseLegalPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Base legal
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Legislação e normas do estágio curricular supervisionado.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Esta página reunirá a legislação aplicável, documentos normativos,
            orientações internas e demais atos relacionados ao Integra Estágio.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {legalItems.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-800 shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
