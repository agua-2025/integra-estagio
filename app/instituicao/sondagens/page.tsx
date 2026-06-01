import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Enviadas",
    value: "0",
    description: "Consultas de campo encaminhadas ao Município.",
  },
  {
    label: "Em análise",
    value: "0",
    description: "Sondagens aguardando manifestação da Coordenadoria ou unidade.",
  },
  {
    label: "Viáveis",
    value: "0",
    description: "Consultas com possibilidade de campo identificada.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Consultas aguardando complemento de informações.",
  },
];

const inquiries = [
  {
    course: "Direito",
    quantity: "5 estudantes",
    period: "2º semestre de 2026",
    workload: "100h",
    requestedArea: "Jurídico, Administração ou Apoio Legislativo",
    status: "Aguardando unidade",
    response:
      "A consulta foi recebida pela Coordenadoria e encaminhada para manifestação das unidades municipais compatíveis.",
  },
  {
    course: "Serviço Social",
    quantity: "3 estudantes",
    period: "Conforme calendário acadêmico",
    workload: "120h",
    requestedArea: "Assistência Social",
    status: "Viabilidade parcial",
    response:
      "Há possibilidade condicionada à disponibilidade de supervisor e ajuste de horários com a unidade responsável.",
  },
  {
    course: "Técnico em Administração",
    quantity: "2 estudantes",
    period: "A definir",
    workload: "80h",
    requestedArea: "Administração e Gestão Pública",
    status: "Recebida",
    response:
      "A consulta foi registrada e ainda será analisada pela Coordenadoria.",
  },
];

export default function InstituicaoSondagensPage() {
  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Acompanhar Sondagens"
      description="Consulte o andamento das solicitações de campo de estágio encaminhadas ao Município."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da instituição
        </Link>

        <Link
          href="/instituicao/consultar-campo"
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Nova consulta
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Consultas de campo
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na versão com banco de dados,
            a instituição poderá acompanhar cada sondagem, visualizar respostas,
            complementar informações e, havendo viabilidade, solicitar o Acordo
            de Cooperação Técnica.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {inquiries.map((inquiry) => (
            <article
              key={`${inquiry.course}-${inquiry.period}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {inquiry.course}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {inquiry.requestedArea}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {inquiry.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
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

              <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
                  Resposta atual
                </p>
                <p className="mt-2 text-sm leading-6 text-teal-900">
                  {inquiry.response}
                </p>
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
                  Complementar
                </button>

                <button
                  type="button"
                  className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                >
                  Solicitar acordo
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Acompanhamento transparente"
          description="A instituição poderá visualizar em qual etapa está cada consulta e se há manifestação pendente da unidade ou da Coordenadoria."
          status="Fluxo"
        />
        <ActionCard
          title="Complementação de dados"
          description="Quando necessário, a Coordenadoria poderá solicitar informações adicionais antes de concluir a viabilidade."
        />
        <ActionCard
          title="Próxima etapa"
          description="Sondagens viáveis poderão habilitar a solicitação do Acordo de Cooperação Técnica."
        />
      </section>
    </SystemShell>
  );
}
