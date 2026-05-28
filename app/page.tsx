import Link from "next/link";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

const audiences = [
  {
    title: "Instituição de ensino",
    description:
      "Consulte a disponibilidade de campo de estágio, solicite cooperação institucional e acompanhe os encaminhamentos dos estudantes.",
    action: "Iniciar consulta",
    href: "/instituicoes",
  },
  {
    title: "Estudante",
    description:
      "Entenda como funciona o estágio curricular supervisionado e acompanhe sua solicitação quando apresentada pela instituição.",
    action: "Ver orientações",
    href: "/estudantes",
  },
  {
    title: "Órgão municipal",
    description:
      "Informe disponibilidade de campo, indique supervisor e acompanhe os estágios autorizados na unidade.",
    action: "Acessar orientações",
    href: "/orgaos-municipais",
  },
];

const documents = [
  "Acordo de Cooperação Técnica",
  "Termo de Compromisso de Estágio",
  "Carta de Apresentação",
  "Plano de Atividades",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
            Programa de Estágio Curricular Supervisionado
          </div>

          <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Aprenda na prática. Participe da rotina dos órgãos municipais.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            O Integra Estágio aproxima instituições de ensino, estudantes e
            unidades municipais para organizar, formalizar e acompanhar estágios
            curriculares supervisionados de forma simples, segura e transparente.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/instituicoes"
              className="rounded-xl bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Consultar campo de estágio
            </Link>
            <Link
              href="/estudantes"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Quero entender o estágio
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-teal-700">01</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Consulta de campo
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-teal-700">02</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Formalização
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-bold text-teal-700">03</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Vivência prática
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-teal-200/40 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-sky-200/50 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-sky-700 p-7 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Formação em movimento
              </p>

              <h3 className="mt-4 text-3xl font-bold tracking-tight">
                Experiência supervisionada para transformar aprendizado em
                prática.
              </h3>

              <p className="mt-4 leading-7 text-teal-50">
                O estágio curricular supervisionado permite ao estudante
                vivenciar atividades compatíveis com sua formação, sempre com
                orientação da instituição de ensino e supervisão da unidade
                concedente.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Para instituições
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Consulte campos, formalize a cooperação e acompanhe os
                  estudantes encaminhados.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Para estudantes
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Acompanhe sua jornada de estágio com documentos, orientações e
                  etapas organizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="publicos" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Atendimento por perfil
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Uma área para cada participante do processo.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              O sistema será organizado para que cada público encontre apenas as
              informações e ações necessárias para sua etapa.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {audiences.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-xl font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  {item.action}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Fluxo simplificado
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Primeiro a viabilidade, depois a formalização.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A instituição consulta a existência de campo de estágio. Havendo
              viabilidade, o Município formaliza a cooperação e organiza os
              documentos necessários para o início das atividades.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Consulta de campo",
              "Manifestação das unidades",
              "Acordo de Cooperação",
              "Ajuste com o setor",
              "Documentos individuais",
              "Início autorizado",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-sm font-bold text-teal-700">
                  Etapa {index + 1}
                </span>
                <h3 className="mt-2 font-bold text-slate-950">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="documentos" className="bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">
              Documentos
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Modelos padronizados para reduzir retrabalho.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              O Integra Estágio será preparado para organizar documentos
              institucionais e individuais, mantendo histórico e controle das
              etapas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 text-white"
              >
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Próximo passo
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950">
            Consulte a disponibilidade de campo de estágio curricular
            supervisionado.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            A formalização começa pela sondagem de campo. O Município verifica a
            possibilidade junto às unidades e orienta a instituição sobre as
            próximas etapas.
          </p>
          <Link
            href="/instituicoes"
            className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Iniciar consulta
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}