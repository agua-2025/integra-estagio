import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

type AcessoPageProps = {
  searchParams?: Promise<{
    negado?: string;
  }>;
};

export default async function AcessoPage({ searchParams }: AcessoPageProps) {
  const params = await searchParams;
  const accessDenied = params?.negado === "1";

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
            {accessDenied ? "Acesso não autorizado." : "Acesse o Integra Estágio."}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {accessDenied
              ? "A conta conectada não possui permissão para acessar esta área."
              : "Entre com sua conta para acessar as funcionalidades disponíveis conforme o seu perfil no Programa de Estágio."}
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
      </section>

      <PublicFooter />
    </main>
  );
}
