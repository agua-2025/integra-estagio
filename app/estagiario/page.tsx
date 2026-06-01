import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Situação",
    value: "Em análise",
    description: "Apresentação aguardando validação.",
  },
  {
    label: "Documentos",
    value: "4/6",
    description: "Documentos recebidos ou pendentes.",
  },
  {
    label: "Início",
    value: "Aguardar",
    description: "Estágio ainda não autorizado.",
  },
];

const actions = [
  {
    title: "Consultar documentos",
    description:
      "Verifique documentos recebidos, pendências e orientações da instituição ou Coordenadoria.",
  },
  {
    title: "Acompanhar andamento",
    description:
      "Veja mensagens, atualizações e etapas do processo até a conclusão ou encerramento do estágio.",
  },
];

export default function EstagiarioAreaPage() {
  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Situação, documentos e orientações"
      description="Ambiente do estudante para acompanhar sua apresentação, documentos, autorização de início e orientações do estágio."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Acompanhamento do estudante
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Consulte sua situação e acompanhe as etapas liberadas pela
            Coordenadoria.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/estagiario/situacao"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Minha situação
              </h3>
              <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Acompanhar
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Consulte sua apresentação, documentos, campo pretendido e
              autorização de início.
            </p>
          </Link>

          <Link
            href="/estagiario/orientacoes"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-teal-800">
                Orientações do estágio
              </h3>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Após autorização
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Após autorização, consulte unidade, supervisor, horários e
              instruções para início das atividades.
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
