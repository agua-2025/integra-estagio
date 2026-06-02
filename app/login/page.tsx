import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Acesso ao sistema
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Entre para acompanhar o fluxo do Integra Estágio.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            O acesso é destinado à Coordenadoria, instituições de ensino,
            unidades municipais e estagiários autorizados.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm leading-6 text-amber-900">
              Nesta etapa inicial, o cadastro de usuários será feito de forma
              controlada, para garantir que cada pessoa receba o perfil correto
              antes de acessar os dados do sistema.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Login
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informe seu e-mail e senha cadastrados.
          </p>

          <LoginForm />

          <div className="mt-6 border-t border-slate-200 pt-5">
            <Link
              href="/acesso"
              className="text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              Voltar para escolha de área
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
