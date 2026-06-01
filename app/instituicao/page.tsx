import Link from "next/link";
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
            O sistema libera cada etapa conforme o andamento do processo.
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
                Liberado
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

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-amber-950">
                Solicitar Acordo de Cooperação
              </h3>
              <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Condicionado
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-amber-900">
              Esta etapa será liberada somente após uma sondagem receber
              viabilidade positiva ou viabilidade parcial aprovada pela
              Coordenadoria.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-white/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Regra aplicada
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Sondagens em análise, aguardando unidade, pendentes de
                complementação ou sem disponibilidade não permitem abertura de
                Acordo de Cooperação.
              </p>
            </div>
          </div>

          <Link
            href="/instituicao/acordos"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Acompanhar acordos
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Consulta
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Consulte pedidos de cooperação, minutas, assinaturas, publicações
              e vigência dos acordos.
            </p>
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950">
                Apresentar estudantes
              </h3>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Bloqueado
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              O encaminhamento de estudantes será liberado apenas após Acordo de
              Cooperação ativo, assinado, publicado e dentro da vigência.
            </p>
          </div>
        </div>
      </section>
    </SystemShell>
  );
}
