import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Consultas",
    value: "0",
    description: "Sondagens de campo enviadas pela instituição.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos de cooperação em análise ou ativos.",
  },
  {
    label: "Estudantes",
    value: "0",
    description: "Estudantes apresentados ao Município.",
  },
];

const actions = [
  {
    title: "Solicitar Acordo de Cooperação",
    description:
      "Após viabilidade positiva, formalize o pedido de cooperação institucional com o Município.",
  },
  {
    title: "Apresentar estudantes",
    description:
      "Encaminhe estudantes após a cooperação ativa e acompanhe pendências documentais.",
  },
];

export default function InstituicaoAreaPage() {
  return (
    <SystemShell
      areaLabel="Área da Instituição de Ensino"
      title="Consultas, cooperação e estudantes"
      description="Ambiente destinado às instituições de ensino para consultar campos de estágio, formalizar cooperação e acompanhar os estudantes encaminhados."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Próximas ações
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Selecione a ação correspondente à etapa da instituição.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/instituicao/consultar-campo"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Consultar campo de estágio
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Primeiro passo
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Informe curso, quantidade estimada, carga horária e período
              pretendido para análise de viabilidade.
            </p>
          </Link>

          <Link
            href="/instituicao/sondagens"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Acompanhar sondagens
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Andamento
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Veja o andamento das consultas encaminhadas, respostas da
              Coordenadoria e manifestações das unidades.
            </p>
          </Link>

          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
