import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Aptos",
    value: "0",
    description: "Estudantes com documentação validada.",
  },
  {
    label: "Aguardando unidade",
    value: "0",
    description: "Processos pendentes de confirmação de unidade ou supervisor.",
  },
  {
    label: "Autorizados",
    value: "0",
    description: "Estágios liberados para início.",
  },
  {
    label: "Pendências",
    value: "0",
    description: "Processos que ainda impedem a autorização.",
  },
];

const authorizations = [
  {
    student: "Estudante Exemplo 01",
    institution: "Faculdade ou Universidade Exemplo",
    course: "Direito",
    unit: "Unidade a definir",
    supervisor: "Aguardando indicação",
    status: "Apto com pendência de unidade",
    start: "A definir",
    period: "2º semestre de 2026",
  },
  {
    student: "Estudante Exemplo 02",
    institution: "Instituição Cooperada Exemplo",
    course: "Serviço Social",
    unit: "Secretaria Municipal de Assistência Social",
    supervisor: "Supervisor Exemplo",
    status: "Pronto para autorizar",
    start: "A definir",
    period: "Conforme calendário acadêmico",
  },
  {
    student: "Estudante Exemplo 03",
    institution: "Centro de Ensino Técnico Exemplo",
    course: "Técnico em Administração",
    unit: "Secretaria Municipal de Administração",
    supervisor: "Servidor Supervisor Exemplo",
    status: "Autorizado",
    start: "01/06/2026",
    period: "01/06/2026 a 30/08/2026",
  },
];

function statusClass(status: string) {
  if (status === "Autorizado") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "Pronto para autorizar") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

export default function CoordenadoriaAutorizacoesPage() {
  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Autorizações de Início"
      description="Controle a liberação formal dos estudantes para início das atividades nas unidades municipais."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <Link
          href="/coordenadoria/estudantes"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estudantes
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
              Liberações para início
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Listagem compacta para conferir estudante, acordo, unidade,
              supervisor, período e situação da autorização.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todos", "Prontos", "Pendentes", "Autorizados"].map((filter) => (
              <button
                key={filter}
                type="button"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Estudante</th>
                  <th className="px-5 py-4 font-bold">Instituição</th>
                  <th className="px-5 py-4 font-bold">Curso</th>
                  <th className="px-5 py-4 font-bold">Unidade</th>
                  <th className="px-5 py-4 font-bold">Supervisor</th>
                  <th className="px-5 py-4 font-bold">Início</th>
                  <th className="px-5 py-4 font-bold">Período</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {authorizations.map((item) => (
                  <tr key={`${item.student}-${item.course}`} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {item.student}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.institution}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.course}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.unit}</td>
                    <td className="px-5 py-4 text-slate-700">{item.supervisor}</td>
                    <td className="px-5 py-4 text-slate-700">{item.start}</td>
                    <td className="px-5 py-4 text-slate-700">{item.period}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}>
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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
                        >
                          Ajustar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                        >
                          Autorizar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
            Na versão com banco de dados, a autorização dependerá de documentos
            validados, acordo ativo, campo aprovado, unidade definida e supervisor indicado.
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <ActionCard
          title="Autorização formal"
          description="O estágio somente poderá iniciar após autorização registrada pela Coordenadoria."
          status="Regra"
        />
        <ActionCard
          title="Unidade e supervisor"
          description="A autorização deve indicar unidade municipal, supervisor responsável, período e horários previstos."
        />
        <ActionCard
          title="Histórico do processo"
          description="A autorização deverá ficar vinculada ao estudante, instituição, acordo, campo aprovado e documentos analisados."
        />
      </section>
    </SystemShell>
  );
}
