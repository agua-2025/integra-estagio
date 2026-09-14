import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function AcessoPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Image
              src="/branding/logo-stacked.png"
              alt="Integra Estágio"
              width={1600}
              height={1600}
              priority
              className="h-44 w-auto sm:h-52"
            />
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-teal-700">
            Acesso ao sistema
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Acesse o Integra Estágio.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Entre com sua conta para acessar as funcionalidades disponíveis
            conforme o seu perfil no Programa de Estágio.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="rounded-2xl bg-teal-700 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800"
            >
              Acessar sistema
            </Link>
          </div>
        </div>

        <div className="mt-12 w-full max-w-3xl rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-7 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">
            Ainda não tem acesso?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Solicite a criação ou liberação da sua conta à Coordenadoria
            responsável pelo Programa de Estágio. Após a autenticação, o sistema
            direcionará automaticamente para a área correspondente ao seu perfil.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
