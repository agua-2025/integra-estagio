import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const accessAreas = [
  "Área da Instituição de Ensino",
  "Área da Coordenadoria",
  "Área da Unidade Municipal",
  "Área do Estagiário",
];

export default function AcessoPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Acesso ao sistema
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Área restrita do Integra Estágio
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            O acesso será destinado às instituições de ensino, Coordenadoria,
            unidades municipais e estagiários, conforme o perfil de cada usuário.
          </p>

          <div className="mt-8 grid gap-3">
            {accessAreas.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Voltar ao início
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
