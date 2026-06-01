import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Recebidas",
    value: "0",
    description: "Sondagens enviadas por instituições de ensino.",
  },
  {
    label: "Aguardando unidades",
    value: "0",
    description: "Consultas encaminhadas para manifestação das unidades.",
  },
  {
    label: "Viáveis",
    value: "0",
    description: "Sondagens com possibilidade de campo identificada.",
  },
  {
    label: "Sem campo",
    value: "0",
    description: "Consultas sem disponibilidade no momento.",
  },
];

const inquiries = [
  {
    institution: "Faculdade ou Universidade Exemplo",
    course: "Direito",
    quantity: "5 estudantes",
    period: "2º semestre de 2026",
    workload: "100h",
    area: "Jurídico, Administração ou Apoio Legislativo",
    status: "Aguardando manifestação",
    description:
      "Instituição consulta a possibilidade de campo para estágio curricular supervisionado obrigatório na área jurídica ou administrativa.",
  },
  {
    institution: "Instituição Cooperada Exemplo",
    course: "Serviço Social",
    quantity: "3 estudantes",
    period: "Conforme calendário acadêmico",
    workload: "120h",
    area: "Assistência Social",
    status: "Viabilidade parcial",
    description:
      "Consulta com possibilidade condicionada à manifestação da unidade responsável e disponibilidade de supervisor.",
  },
  {
    institution: "Centro de Ensino Técnico Exemplo",
    course: "Técnico em Administração",
    quantity: "2 estudantes",
    period: "A definir",
    workload: "80h",
    area: "Administração e Gestão Pública",
    status: "Recebida",
    description:
      "Sondagem inicial para verificação de campo em rotinas administrativas e apoio institucional.",
  },
];

export default function SondagensPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Sondagens de Campo de Estágio"
      description="Analise consultas enviadas pelas instituições, encaminhe às unidades municipais e consolide a viabilidade dos campos de estágio."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <button
          type="button"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Nova sondagem
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Consultas recebidas
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na versão com banco de dados,
            a Coordenadoria poderá receber sondagens, encaminhar para unidades,
            registrar manifestações e responder à instituição sobre a viabilidade
            do campo de estágio.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {inquiries.map((inquiry) => (
            <article
              key={`${inquiry.institution}-${inquiry.course}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {inquiry.course}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {inquiry.institution}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {inquiry.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {inquiry.description}
              </p>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Área pretendida
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {inquiry.area}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Quantidade
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {inquiry.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Carga
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {inquiry.workload}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Período
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {inquiry.period}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Ver detalhes
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Encaminhar unidade
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                >
                  Responder
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Encaminhamento às unidades"
          description="A Coordenadoria poderá direcionar a sondagem para uma ou mais unidades municipais, solicitando manifestação sobre disponibilidade."
          status="Fluxo"
        />
        <ActionCard
          title="Resposta de viabilidade"
          description="A resposta poderá indicar viabilidade total, parcial, inexistência de campo ou necessidade de complementação."
        />
        <ActionCard
          title="Conversão em acordo"
          description="Quando houver viabilidade, a sondagem poderá permitir a abertura do pedido de Acordo de Cooperação Técnica."
        />
      </section>
    </SystemShell>
  );
}
