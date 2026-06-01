import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Em andamento",
    value: "0",
    description: "Estágios ainda em execução na unidade.",
  },
  {
    label: "A encerrar",
    value: "0",
    description: "Estágios próximos do término previsto.",
  },
  {
    label: "Relatórios pendentes",
    value: "0",
    description: "Encerramentos aguardando manifestação da unidade.",
  },
  {
    label: "Finalizados",
    value: "0",
    description: "Estágios concluídos com relatório registrado.",
  },
];

const reports = [
  {
    student: "Estudante Exemplo 01",
    institution: "Faculdade ou Universidade Exemplo",
    course: "Direito",
    supervisor: "Servidor Supervisor Exemplo",
    period: "01/06/2026 a 30/08/2026",
    workload: "100h",
    status: "A encerrar",
  },
  {
    student: "Estudante Exemplo 02",
    institution: "Instituição Cooperada Exemplo",
    course: "Serviço Social",
    supervisor: "Supervisora Exemplo",
    period: "15/05/2026 a 15/08/2026",
    workload: "120h",
    status: "Relatório pendente",
  },
  {
    student: "Estudante Exemplo 03",
    institution: "Centro de Ensino Técnico Exemplo",
    course: "Técnico em Administração",
    supervisor: "Servidor Supervisor Exemplo",
    period: "01/03/2026 a 31/05/2026",
    workload: "80h",
    status: "Finalizado",
  },
];

const formFields = [
  "Estagiário",
  "Período efetivamente realizado",
  "Carga horária cumprida",
  "Resumo das atividades desenvolvidas",
  "Observações do supervisor",
  "Situação do encerramento",
];

function statusClass(status: string) {
  if (status === "Finalizado") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "Relatório pendente") {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
}

export default function UnidadeRelatorioFinalPage() {
  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Relatório Final"
      description="Registre o encerramento do estágio, resumo das atividades, carga horária cumprida e observações da unidade."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Registrar encerramento
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Esta tela é visual nesta etapa. Depois, o relatório ficará
              vinculado ao estudante, unidade, supervisor, instituição e período
              do estágio.
            </p>
          </div>

          <div className="space-y-4">
            {formFields.map((field) => (
              <label key={field} className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {field}
                </span>

                <div
                  className={
                    field.includes("Resumo") || field.includes("Observações")
                      ? "min-h-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400"
                      : "h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                  }
                >
                  Campo a preencher
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Registrar relatório
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Salvar rascunho
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-950">
              Encerramentos recentes
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Listagem compacta para controle de relatórios finais.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Estagiário</th>
                  <th className="px-5 py-4 font-bold">Instituição</th>
                  <th className="px-5 py-4 font-bold">Curso</th>
                  <th className="px-5 py-4 font-bold">Supervisor</th>
                  <th className="px-5 py-4 font-bold">Período</th>
                  <th className="px-5 py-4 font-bold">Carga</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((item) => (
                  <tr
                    key={`${item.student}-${item.course}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {item.student}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.institution}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.course}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.supervisor}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.period}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.workload}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
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
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                        >
                          Registrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Encerramento formal"
          description="O relatório final servirá para registrar o fechamento do estágio no âmbito da unidade municipal."
          status="Regra"
        />
        <ActionCard
          title="Histórico preservado"
          description="O encerramento deverá ficar vinculado ao estudante, instituição, acordo, unidade e supervisor."
        />
        <ActionCard
          title="Consulta posterior"
          description="Depois de finalizado, o estágio poderá ser consultado pela Coordenadoria, unidade, instituição e estudante."
        />
      </section>
    </SystemShell>
  );
}
