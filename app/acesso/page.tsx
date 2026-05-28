import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const accessAreas = [
  {
    title: "Instituição de Ensino",
    description:
      "Consulte campos de estágio, acompanhe a viabilidade, solicite cooperação e apresente estudantes.",
    href: "/instituicao",
  },
  {
    title: "Coordenadoria",
    description:
      "Analise solicitações, consulte unidades, controle acordos, valide documentos e autorize estágios.",
    href: "/coordenadoria",
  },
  {
    title: "Unidade Municipal",
    description:
      "Responda sondagens, informe disponibilidade, indique supervisor e acompanhe estudantes.",
    href: "/unidade",
  },
  {
    title: "Estagiário",
    description:
      "Acompanhe sua solicitação, consulte documentos, orientações e informações do estágio.",
    href: "/estagiario",
  },
];

export default function AcessoPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
              <Image
                src="/branding/logo-horizontal.png"
                alt="Integra Estágio"
                width={520}
                height={170}
                priority
                className="h-20 w-auto sm:h-24"
              />
            </div>
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-teal-700">
            Acesso ao sistema
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Entre na área correspondente ao seu perfil.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            O Integra Estágio será organizado em quatro áreas principais, para
            que cada participante acompanhe apenas as informações e etapas de sua
            responsabilidade.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {accessAreas.map((area) => (
            <Link
              key={area.title}
              href={area.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 group-hover:text-teal-800">
                    {area.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {area.description}
                  </p>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Acessar
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">
            Login e permissões serão ativados na próxima etapa.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Por enquanto, as áreas estão disponíveis apenas para validação visual
            e organização inicial do sistema. Depois, cada usuário acessará
            somente sua própria área mediante autenticação.
          </p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
