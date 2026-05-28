import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function OrgaosMunicipaisPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Órgãos municipais
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Unidades municipais como campo de aprendizagem prática.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              As unidades municipais participam do processo informando
              disponibilidade, atividades compatíveis, horários, quantidade
              possível de estudantes e servidor responsável pela supervisão.
            </p>

            <div className="mt-8">
              <Link
                href="/acesso"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
              >
                Acessar área da unidade
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Responsabilidades da unidade
            </h2>

            <div className="mt-6 space-y-4">
              {[
                "Responder sondagens encaminhadas pela Coordenadoria",
                "Informar se há campo compatível com o curso",
                "Indicar local, horários e quantidade possível",
                "Designar servidor supervisor",
                "Descrever atividades compatíveis com a formação do estudante",
                "Acompanhar frequência, atividades e ocorrências",
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
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
