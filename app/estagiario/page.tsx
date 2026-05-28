import { PanelCard } from "@/components/system/PanelCard";
import { SystemHeader } from "@/components/system/SystemHeader";

const actions = [
  {
    title: "Acompanhar solicitação",
    description:
      "Consulte a situação do processo encaminhado pela instituição de ensino e validado pelo Município.",
  },
  {
    title: "Visualizar documentos",
    description:
      "Acesse carta de apresentação, termo de compromisso, plano de atividades e demais documentos vinculados ao estágio.",
  },
  {
    title: "Consultar orientações",
    description:
      "Veja informações importantes sobre início, acompanhamento, conduta e encerramento do estágio.",
  },
  {
    title: "Carga horária e período",
    description:
      "Acompanhe dados do estágio, unidade concedente, supervisor, período previsto e carga horária.",
  },
];

export default function EstagiarioAreaPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SystemHeader />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Área do Estagiário
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Acompanhamento simples da jornada de estágio.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            O estagiário poderá acompanhar a situação do processo, consultar
            documentos, verificar orientações e visualizar informações sobre a
            unidade, supervisor e período do estágio.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {actions.map((item) => (
            <PanelCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
