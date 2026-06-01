import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Recebidas",
    value: "0",
    description: "Sondagens encaminhadas pela Coordenadoria.",
  },
  {
    label: "Pendentes",
    value: "0",
    description: "Consultas aguardando manifestação da unidade.",
  },
  {
    label: "Aceitas",
    value: "0",
    description: "Sondagens com possibilidade de campo informada.",
  },
  {
    label: "Sem disponibilidade",
    value: "0",
    description: "Consultas recusadas por ausência de campo no momento.",
  },
];

const inquiries = [
  {
    course: "Direito",
    institution: "Faculdade ou Universidade Exemplo",
    quantity: "5 estudantes",
    period: "2º semestre de 2026",
    workload: "100h",
    requestedArea: "Jurídico, Administração ou Apoio Legislativo",
    status: "Pendente",
    description:
      "A Coordenadoria solicita manifestação da unidade sobre possibilidade de receber estudantes para atividades compatíveis com o curso.",
  },
  {
    course: "Administração",
    institution: "Faculdade ou Universidade Exemplo",
    quantity: "3 estudantes",
    period: "A definir",
    workload: "80h",
    requestedArea: "Rotinas administrativas",
    status: "Em análise",
    description:
      "Consulta encaminhada para verificação de local, horários, atividades possíveis e disponibilidade de supervisor.",
  },
  {
    course: "Técnico em Informática",
    institution: "Centro de Ensino Técnico Exemplo",
    quantity: "2 estudantes",
    period: "Conforme calendário da instituição",
    workload: "120h",
    requestedArea: "Tecnologia e CPD",
    status: "Pendente",
    description:
      "Sondagem para avaliar campo de estágio em suporte, sistemas, equipamentos e organização de processos digitais.",
  },
];

const responseOptions = [
  "Há campo disponível",
  "Há campo com limite de estudantes",
  "Não há campo disponível no momento",
  "Precisa de reunião ou análise complementar",
];

export default function UnidadeSondagensPage() {
  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Responder Sondagens"
      description="Analise consultas encaminhadas pela Coordenadoria e informe se a unidade possui condições de receber estudantes para estágio curricular supervisionado."
    >
      <div className="mb-6">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
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
            Consultas aguardando manifestação
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Estes registros são exemplos visuais. Na versão com banco de dados,
            a unidade poderá informar disponibilidade, limite de estudantes,
            horários, supervisor, atividades compatíveis e observações.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {inquiries.map((inquiry) => (
            <article
              key={`${inquiry.course}-${inquiry.institution}`}
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
                    {inquiry.requestedArea}
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

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Resposta da unidade
                </p>

                <div className="mt-3 grid gap-2">
                  {responseOptions.map((option) => (
                    <div
                      key={option}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {option}
                    </div>
                  ))}
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
                  Indicar supervisor
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
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
          title="Manifestação objetiva"
          description="A unidade deve responder se possui ou não campo disponível, podendo limitar quantidade, horários ou condições."
          status="Regra"
        />
        <ActionCard
          title="Supervisor obrigatório"
          description="Havendo aceite, a unidade deverá indicar servidor responsável pela supervisão do estágio."
        />
        <ActionCard
          title="Atividades compatíveis"
          description="A resposta deve considerar se as atividades possíveis guardam relação com o curso e a finalidade do estágio."
        />
      </section>
    </SystemShell>
  );
}
