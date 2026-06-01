import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Sondagens",
    value: "0",
    description: "Consultas registradas no período.",
  },
  {
    label: "Acordos",
    value: "0",
    description: "Acordos em análise, ativos ou vencidos.",
  },
  {
    label: "Estudantes",
    value: "0",
    description: "Estudantes apresentados ou autorizados.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Processos aguardando ação ou correção.",
  },
];

const reportGroups = [
  {
    title: "Sondagens por situação",
    description:
      "Acompanhe consultas recebidas, em análise, encaminhadas às unidades, viáveis, parcialmente viáveis e sem disponibilidade.",
    status: "Fluxo",
  },
  {
    title: "Acordos por vigência",
    description:
      "Consulte acordos em análise, aguardando assinatura, publicados, ativos, vencidos, encerrados ou cancelados.",
  },
  {
    title: "Estudantes por etapa",
    description:
      "Visualize estudantes apresentados, em análise documental, com correção solicitada, aptos e autorizados.",
  },
  {
    title: "Estágios em andamento",
    description:
      "Controle estágios autorizados, unidade responsável, supervisor, período, horários e situação atual.",
  },
  {
    title: "Ocorrências registradas",
    description:
      "Acompanhe ocorrências por unidade, estudante, tipo, status e necessidade de providência.",
  },
  {
    title: "Relatórios finais",
    description:
      "Monitore estágios encerrados, relatórios pendentes, finalizados e registros de conclusão.",
  },
];

const auditRows = [
  {
    date: "Hoje",
    module: "Sondagens",
    action: "Consulta registrada",
    responsible: "Instituição de Ensino",
    status: "Exemplo visual",
  },
  {
    date: "Ontem",
    module: "Acordos",
    action: "Minuta encaminhada para assinatura",
    responsible: "Coordenadoria",
    status: "Exemplo visual",
  },
  {
    date: "25/05/2026",
    module: "Estudantes",
    action: "Documentação marcada como apta",
    responsible: "Coordenadoria",
    status: "Exemplo visual",
  },
  {
    date: "24/05/2026",
    module: "Unidade",
    action: "Ocorrência registrada",
    responsible: "Unidade Municipal",
    status: "Exemplo visual",
  },
];

const indicators = [
  {
    label: "Sondagens viáveis",
    value: "0%",
  },
  {
    label: "Acordos ativos",
    value: "0",
  },
  {
    label: "Tempo médio de análise",
    value: "—",
  },
  {
    label: "Pendências documentais",
    value: "0",
  },
];

export default function CoordenadoriaRelatoriosPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Relatórios e Auditoria"
      description="Acompanhe indicadores, pendências, situação dos processos e histórico das movimentações do Integra Estágio."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Exportar relatório
          </button>

          <button
            type="button"
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Filtrar período
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Indicadores de gestão
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Área visual para futuros indicadores do sistema. Depois, os dados
            serão calculados a partir das tabelas do Supabase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {indicators.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Relatórios disponíveis
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Os relatórios serão organizados por módulo, permitindo consulta por
            período, instituição, unidade, curso, status e responsável.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reportGroups.map((item) => (
            <ActionCard
              key={item.title}
              title={item.title}
              description={item.description}
              status={item.status}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Histórico e auditoria
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Listagem compacta para registrar movimentações relevantes,
              alterações de status, responsáveis e datas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todos", "Sondagens", "Acordos", "Estudantes", "Unidades"].map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Data</th>
                  <th className="px-5 py-4 font-bold">Módulo</th>
                  <th className="px-5 py-4 font-bold">Ação</th>
                  <th className="px-5 py-4 font-bold">Responsável</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {auditRows.map((row) => (
                  <tr
                    key={`${row.date}-${row.module}-${row.action}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {row.date}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{row.module}</td>
                    <td className="px-5 py-4 text-slate-700">{row.action}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {row.responsible}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Detalhes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
            Na versão com banco de dados, esta tabela será alimentada por logs e
            registros de auditoria, com filtros por período, usuário, módulo e
            tipo de ação.
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Auditoria desde o início"
          description="As principais ações do sistema devem gerar histórico: criação, alteração, envio, aprovação, correção, autorização e encerramento."
          status="Regra"
        />
        <ActionCard
          title="Relatórios por perfil"
          description="A Coordenadoria terá visão ampla, enquanto instituição, unidade e estagiário verão apenas informações vinculadas ao próprio perfil."
        />
        <ActionCard
          title="Base para tomada de decisão"
          description="Os relatórios ajudarão a identificar gargalos, pendências, demanda por curso, unidades com maior procura e estágios em andamento."
        />
      </section>
    </SystemShell>
  );
}
