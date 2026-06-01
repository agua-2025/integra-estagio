import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Autorizados",
    value: "0",
    description: "Estagiários liberados para atuação na unidade.",
  },
  {
    label: "Em andamento",
    value: "0",
    description: "Estágios em execução na unidade municipal.",
  },
  {
    label: "Ocorrências",
    value: "0",
    description: "Registros pendentes de acompanhamento.",
  },
  {
    label: "Encerramento",
    value: "0",
    description: "Estágios próximos do término ou aguardando relatório.",
  },
];

const interns = [
  {
    student: "Estudante Exemplo 01",
    institution: "Faculdade ou Universidade Exemplo",
    course: "Direito",
    status: "Autorizado para início",
    period: "01/06/2026 a 30/08/2026",
    schedule: "Segunda a quinta, 13h às 17h",
    supervisor: "Servidor Supervisor Exemplo",
    field: "Jurídico / Administração",
  },
  {
    student: "Estudante Exemplo 02",
    institution: "Instituição Cooperada Exemplo",
    course: "Serviço Social",
    status: "Em andamento",
    period: "15/05/2026 a 15/08/2026",
    schedule: "Terça e quinta, 7h às 11h",
    supervisor: "Supervisora Exemplo",
    field: "Assistência Social",
  },
  {
    student: "Estudante Exemplo 03",
    institution: "Centro de Ensino Técnico Exemplo",
    course: "Técnico em Administração",
    status: "Aguardando início",
    period: "10/06/2026 a 10/09/2026",
    schedule: "A definir com a unidade",
    supervisor: "Aguardando confirmação",
    field: "Administração e Gestão Pública",
  },
];

function statusClass(status: string) {
  if (status === "Em andamento") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "Autorizado para início") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

export default function UnidadeEstagiariosPage() {
  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Estagiários da Unidade"
      description="Acompanhe estudantes autorizados para atuação na unidade, supervisão, horários, ocorrências e encerramento."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a área da unidade
        </Link>

        <Link
          href="/unidade/sondagens"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver sondagens
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Estagiários vinculados
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Listagem compacta para acompanhamento operacional dos estudantes
              autorizados na unidade municipal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todos", "Autorizados", "Em andamento", "Ocorrências", "Encerramento"].map(
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
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Estudante</th>
                  <th className="px-5 py-4 font-bold">Instituição</th>
                  <th className="px-5 py-4 font-bold">Curso</th>
                  <th className="px-5 py-4 font-bold">Campo</th>
                  <th className="px-5 py-4 font-bold">Período</th>
                  <th className="px-5 py-4 font-bold">Horários</th>
                  <th className="px-5 py-4 font-bold">Supervisor</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {interns.map((intern) => (
                  <tr key={`${intern.student}-${intern.course}`} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {intern.student}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{intern.institution}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {intern.course}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{intern.field}</td>
                    <td className="px-5 py-4 text-slate-700">{intern.period}</td>
                    <td className="px-5 py-4 text-slate-700">{intern.schedule}</td>
                    <td className="px-5 py-4 text-slate-700">{intern.supervisor}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(intern.status)}`}>
                        {intern.status}
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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-800"
                        >
                          Ocorrência
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                        >
                          Relatório
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
            No celular, esta tabela terá rolagem horizontal. Na versão com banco
            de dados, haverá filtros por curso, supervisor, status e período.
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Acompanhamento pela unidade"
          description="A unidade acompanhará frequência prática, atividades, ocorrências e eventuais necessidades de ajuste."
          status="Fluxo"
        />
        <ActionCard
          title="Supervisor responsável"
          description="Todo estagiário autorizado deverá estar vinculado a servidor supervisor indicado pela unidade."
        />
        <ActionCard
          title="Encerramento e relatório"
          description="Ao final, a unidade poderá registrar informações de encerramento e relatório resumido das atividades."
        />
      </section>
    </SystemShell>
  );
}
