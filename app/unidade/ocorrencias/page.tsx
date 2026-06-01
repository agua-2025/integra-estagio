import Link from "next/link";
import { ActionCard } from "@/components/system/ActionCard";
import { SummaryCard } from "@/components/system/SummaryCard";
import { SystemShell } from "@/components/system/SystemShell";

const summaries = [
  {
    label: "Registradas",
    value: "0",
    description: "Ocorrências lançadas pela unidade.",
  },
  {
    label: "Pendentes",
    value: "0",
    description: "Registros aguardando ciência ou providência.",
  },
  {
    label: "Resolvidas",
    value: "0",
    description: "Ocorrências já tratadas ou finalizadas.",
  },
  {
    label: "Críticas",
    value: "0",
    description: "Situações que podem exigir suspensão ou encerramento.",
  },
];

const occurrences = [
  {
    student: "Estudante Exemplo 01",
    course: "Direito",
    type: "Ajuste de horário",
    status: "Pendente",
    date: "01/06/2026",
    description:
      "Unidade solicita ajuste no horário de acompanhamento em razão da rotina interna do setor.",
  },
  {
    student: "Estudante Exemplo 02",
    course: "Serviço Social",
    type: "Falta justificada",
    status: "Resolvida",
    date: "28/05/2026",
    description:
      "Registro de ausência comunicada previamente, sem prejuízo ao acompanhamento do estágio.",
  },
  {
    student: "Estudante Exemplo 03",
    course: "Técnico em Administração",
    type: "Necessidade de orientação",
    status: "Em acompanhamento",
    date: "25/05/2026",
    description:
      "Supervisor registra necessidade de reforçar orientações sobre rotina, tarefas e horários.",
  },
];

const occurrenceTypes = [
  "Falta",
  "Atraso",
  "Ajuste de horário",
  "Alteração de supervisor",
  "Dificuldade de acompanhamento",
  "Encerramento antecipado",
  "Outra ocorrência",
];

function statusClass(status: string) {
  if (status === "Resolvida") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "Em acompanhamento") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

export default function UnidadeOcorrenciasPage() {
  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Registrar Ocorrências"
      description="Registre situações relevantes durante o estágio para acompanhamento da unidade, da Coordenadoria e da instituição de ensino."
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
              Nova ocorrência
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Registro visual para futura comunicação à Coordenadoria quando
              houver fato relevante durante o estágio.
            </p>
          </div>

          <div className="space-y-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Estagiário
              </span>
              <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Selecione o estagiário
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Tipo de ocorrência
              </span>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap gap-2">
                  {occurrenceTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Data da ocorrência
              </span>
              <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                Campo de data
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Descrição
              </span>
              <div className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-400">
                Descreva de forma objetiva o fato ocorrido, providências adotadas
                e eventual necessidade de acompanhamento.
              </div>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Registrar ocorrência
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
              Ocorrências recentes
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Listagem compacta para acompanhamento operacional.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Estagiário</th>
                  <th className="px-5 py-4 font-bold">Curso</th>
                  <th className="px-5 py-4 font-bold">Tipo</th>
                  <th className="px-5 py-4 font-bold">Data</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {occurrences.map((item) => (
                  <tr key={`${item.student}-${item.type}`} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {item.student}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.course}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.type}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.date}</td>
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
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
                        >
                          Concluir
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
          title="Registro responsável"
          description="Ocorrências devem ser objetivas, relacionadas ao estágio e registradas pela unidade responsável pelo acompanhamento."
          status="Regra"
        />
        <ActionCard
          title="Ciência da Coordenadoria"
          description="Na versão com banco de dados, ocorrências relevantes poderão gerar alerta para a Coordenadoria."
        />
        <ActionCard
          title="Histórico do estágio"
          description="Os registros ficarão vinculados ao estudante, à unidade, ao supervisor e ao período do estágio."
        />
      </section>
    </SystemShell>
  );
}
