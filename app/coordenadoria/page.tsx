import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Sondagens",
    value: "0",
    description: "Consultas recebidas para análise de campo.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Processos aguardando documento ou manifestação.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos em análise, assinatura ou vigência.",
  },
  {
    label: "Estágios",
    value: "0",
    description: "Estágios autorizados ou em acompanhamento.",
  },
];

const processActions = [
  {
    title: "Consolidar viabilidade",
    description:
      "Organize as respostas das unidades e informe se há possibilidade total, parcial ou inexistente.",
  },
];

export default function CoordenadoriaAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Coordenadoria"
      title="Controle central do fluxo"
      description="Ambiente responsável por analisar solicitações, consultar unidades, controlar acordos, validar documentos e autorizar o início dos estágios."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Configurações principais
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Organize as bases do sistema antes de liberar os fluxos para as
            instituições e unidades.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/coordenadoria/campos-estagio"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-800">
                  Campos de Estágio
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cadastre, edite, publique ou suspenda áreas disponíveis.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Configurar
              </span>
            </div>
          </Link>

          <Link
            href="/coordenadoria/unidades"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-800">
                  Unidades Municipais
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cadastre secretarias, setores e órgãos que poderão receber estagiários.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Configurar
              </span>
            </div>
          </Link>

          <Link
            href="/coordenadoria/instituicoes-cursos"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-800">
                  Instituições e cursos
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cadastre instituições, cursos, responsáveis e documentos institucionais.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Configurar
              </span>
            </div>
          </Link>

          <Link
            href="/coordenadoria/acordos-cooperacao"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-800">
                  Acordos de Cooperação
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Controle pedidos, minutas, assinaturas, publicações e vigência.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Gerenciar
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Gestão do processo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe as etapas sob responsabilidade da Coordenadoria.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/coordenadoria/sondagens"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Analisar sondagens
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Entrada
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Receba consultas de instituições e encaminhe às unidades municipais
              para manifestação sobre disponibilidade de campo.
            </p>
          </Link>

          <Link
            href="/coordenadoria/estudantes"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Validar estudantes
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Documentos
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Confira carta de apresentação, termo de compromisso, seguro e
              demais documentos antes de liberar a próxima etapa.
            </p>
          </Link>

          <Link
            href="/coordenadoria/autorizacoes"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Autorizar início
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Liberação
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Libere o início do estágio somente após validação completa dos
              documentos, unidade definida e supervisor indicado.
            </p>
          </Link>

          <Link
            href="/coordenadoria/relatorios"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Relatórios e auditoria
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Gestão
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Acompanhe indicadores, pendências, movimentações, histórico e
              auditoria do fluxo de estágio.
            </p>
          </Link>

          {processActions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
