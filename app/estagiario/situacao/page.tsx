import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Situação",
    value: "Em análise",
    description: "Documentos aguardando validação da Coordenadoria.",
  },
  {
    label: "Documentos",
    value: "4/6",
    description: "Quantidade de documentos recebidos ou pendentes.",
  },
  {
    label: "Início",
    value: "Aguardar",
    description: "O estágio ainda não foi autorizado para início.",
  },
];

const documents = [
  {
    name: "Carta de Apresentação",
    status: "Recebida",
  },
  {
    name: "Termo de Compromisso de Estágio",
    status: "Recebido",
  },
  {
    name: "Comprovante de matrícula",
    status: "Recebido",
  },
  {
    name: "Seguro",
    status: "Recebido",
  },
  {
    name: "Plano de Atividades",
    status: "Pendente",
  },
  {
    name: "Autorização de início",
    status: "Aguardando análise",
  },
];

function statusClass(status: string) {
  if (status === "Pendente") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (status === "Recebida" || status === "Recebido") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function EstagiarioSituacaoPage() {
  return (
    <SystemShell
      areaLabel="Área do Estagiário"
      title="Minha Situação"
      description="Acompanhe sua apresentação, documentos, unidade pretendida e autorização de início do estágio."
    >
      <div className="mb-6">
        <Link
          href="/estagiario"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área do estagiário
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
              Acompanhamento
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Dados do estágio
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estes dados são exemplos visuais. Depois, o estagiário visualizará
              somente as informações vinculadas à sua própria apresentação.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Instituição
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Faculdade ou Universidade Exemplo
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Curso
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Direito
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Campo pretendido
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Jurídico, Administração ou Apoio Legislativo
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Unidade municipal
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                A definir pela Coordenadoria
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Supervisor
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Aguardando indicação
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Situação atual
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Aguardando validação documental
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Atenção
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              O estágio ainda não está autorizado para início. Aguarde a
              validação completa da Coordenadoria e a confirmação da unidade
              municipal.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Documentos e pendências
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
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Sem início automático"
          description="A apresentação pela instituição não autoriza o início imediato do estágio. É necessário aguardar validação e liberação formal."
          status="Regra"
        />
        <ActionCard
          title="Pendências documentais"
          description="Quando houver pendência, a instituição poderá complementar informações e documentos solicitados pela Coordenadoria."
        />
        <ActionCard
          title="Após autorização"
          description="Depois da autorização de início, o estagiário poderá consultar unidade, supervisor, horários e orientações práticas."
        />
      </section>
    </SystemShell>
  );
}
