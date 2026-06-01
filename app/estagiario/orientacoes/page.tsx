import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Situação",
    value: "Autorizado",
    description: "Estágio liberado para início pela Coordenadoria.",
  },
  {
    label: "Unidade",
    value: "Definida",
    description: "Unidade municipal responsável pelo acompanhamento.",
  },
  {
    label: "Supervisor",
    value: "Indicado",
    description: "Servidor responsável pela supervisão prática.",
  },
];

const orientationItems = [
  {
    title: "Apresentação na unidade",
    description:
      "O estudante deverá se apresentar na unidade municipal indicada, observando a data, horário e orientações repassadas pela Coordenadoria.",
  },
  {
    title: "Cumprimento de horários",
    description:
      "A carga horária e os horários autorizados devem ser respeitados conforme o termo de compromisso e a organização da unidade.",
  },
  {
    title: "Supervisão",
    description:
      "As atividades devem ser acompanhadas pelo supervisor indicado, respeitando a compatibilidade com o curso e a finalidade do estágio.",
  },
  {
    title: "Comunicação de intercorrências",
    description:
      "Qualquer impossibilidade de comparecimento, alteração de horário ou situação relevante deve ser comunicada à instituição e à unidade.",
  },
];

const documents = [
  {
    name: "Carta de Apresentação",
    status: "Disponível",
  },
  {
    name: "Termo de Compromisso",
    status: "Disponível",
  },
  {
    name: "Autorização de início",
    status: "Emitida",
  },
  {
    name: "Plano de Atividades",
    status: "Validado",
  },
];

function statusClass(status: string) {
  if (status === "Emitida" || status === "Validado" || status === "Disponível") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function EstagiarioOrientacoesPage() {
  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Orientações do Estágio"
      description="Consulte unidade, supervisor, período autorizado, horários e orientações para início das atividades."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/estagiario"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área do estagiário
        </Link>

        <Link
          href="/estagiario/situacao"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver minha situação
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
              Dados autorizados
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Informações para início
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estes dados são exemplos visuais. Depois, serão preenchidos com a
              autorização emitida pela Coordenadoria.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Unidade municipal
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Secretaria Municipal de Administração
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Supervisor
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Servidor Supervisor Exemplo
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Período autorizado
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                01/06/2026 a 30/08/2026
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Horários
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Segunda a quinta, 13h às 17h
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Campo de estágio
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Administração e Gestão Pública
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
              Autorização de início
            </p>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              O estágio está liberado para início somente a partir da data
              autorizada e nas condições indicadas pela Coordenadoria.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Documentos disponíveis
            </h2>

            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {document.name}
                  </p>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                      document.status,
                    )}`}
                  >
                    {document.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ActionCard
            title="Início somente autorizado"
            description="O estudante não deve iniciar atividades antes da liberação formal registrada pela Coordenadoria."
            status="Regra"
          />

          <ActionCard
            title="Contato com a unidade"
            description="Após a autorização, o estudante deverá observar as orientações da unidade e do supervisor indicado."
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Orientações principais
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informações gerais que deverão ser observadas durante o estágio.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {orientationItems.map((item) => (
            <ActionCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </SystemShell>
  );
}
