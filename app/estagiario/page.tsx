import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Situação",
    value: "Pendente",
    description: "Aguardando vínculo com uma solicitação de estágio.",
  },
  {
    label: "Documentos",
    value: "0",
    description: "Documentos disponíveis para consulta.",
  },
  {
    label: "Carga horária",
    value: "0h",
    description: "Carga horária registrada ou prevista no estágio.",
  },
];

const actions = [
  {
    title: "Acompanhar solicitação",
    description:
      "Consulte a situação do processo encaminhado pela instituição de ensino e validado pelo Município.",
    status: "Consulta",
  },
  {
    title: "Visualizar documentos",
    description:
      "Acesse carta de apresentação, termo de compromisso, plano de atividades e documentos vinculados.",
  },
  {
    title: "Consultar orientações",
    description:
      "Veja informações importantes sobre início, acompanhamento, conduta e encerramento do estágio.",
  },
  {
    title: "Dados do estágio",
    description:
      "Acompanhe unidade concedente, supervisor, período previsto e carga horária do estágio.",
  },
];

export default function EstagiarioAreaPage() {
  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Acompanhamento da jornada"
      description="Ambiente do estagiário para consultar situação, documentos, orientações e informações sobre o estágio curricular supervisionado."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Minha jornada
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acompanhe documentos, orientações e informações sobre o estágio.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {actions.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
