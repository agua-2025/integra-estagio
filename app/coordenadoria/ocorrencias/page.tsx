import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getCoordinationOccurrencesData } from "@/lib/queries/coordination-occurrences";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    falta: "Falta",
    atraso: "Atraso",
    ajuste_horario: "Ajuste de horário",
    alteracao_supervisor: "Alteração de supervisor",
    dificuldade_acompanhamento: "Dificuldade de acompanhamento",
    encerramento_antecipado: "Encerramento antecipado",
    outra: "Outra ocorrência",
  };

  return labels[type] ?? type;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    em_acompanhamento: "Em acompanhamento",
    resolvida: "Resolvida",
    critica: "Crítica",
    cancelada: "Cancelada",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "resolvida") {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (status === "em_acompanhamento") {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (status === "critica") {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CoordenadoriaOcorrenciasPage() {
  const { occurrences, error } = await getCoordinationOccurrencesData();

  const registradas = occurrences.length;
  const pendentes = occurrences.filter((item) =>
    ["pendente", "em_acompanhamento"].includes(item.status),
  ).length;
  const resolvidas = occurrences.filter((item) => item.status === "resolvida").length;
  const criticas = occurrences.filter((item) => item.status === "critica").length;

  return (
    <SystemShell
      areaLabel="Coordenadoria"
      title="Ocorrências"
      description="Acompanhe as ocorrências registradas pelas unidades municipais durante a execução dos estágios."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/coordenadoria"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para a Coordenadoria
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/coordenadoria/estudantes"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver estudantes
          </Link>

          <Link
            href="/coordenadoria/autorizacoes"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
          >
            Ver autorizações
          </Link>
        </div>
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Registradas
          </p>
          <p className="text-xl font-black text-slate-950">{registradas}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Pendentes
          </p>
          <p className="text-xl font-black text-amber-700">{pendentes}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Resolvidas
          </p>
          <p className="text-xl font-black text-teal-700">{resolvidas}</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Críticas
          </p>
          <p className="text-xl font-black text-red-700">{criticas}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Ocorrências registradas
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Listagem real das ocorrências lançadas pelas unidades municipais.
          </p>
        </div>

        {occurrences.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">
            Nenhuma ocorrência registrada até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-black">Estudante</th>
                  <th className="px-3 py-2 font-black">Instituição</th>
                  <th className="px-3 py-2 font-black">Curso</th>
                  <th className="px-3 py-2 font-black">Unidade</th>
                  <th className="px-3 py-2 font-black">Tipo</th>
                  <th className="px-3 py-2 font-black">Data</th>
                  <th className="px-3 py-2 font-black">Status</th>
                  <th className="px-3 py-2 font-black">Descrição</th>
                  <th className="px-3 py-2 font-black">Conclusão</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {occurrences.map((occurrence) => (
                  <tr key={occurrence.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 align-top font-black text-slate-950">
                      {occurrence.student_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {occurrence.institution_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {occurrence.course_name}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {occurrence.municipal_unit_name}
                    </td>

                    <td className="px-3 py-2 align-top font-semibold text-slate-800">
                      {typeLabel(occurrence.occurrence_type)}
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {formatDate(occurrence.occurrence_date)}
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusClass(
                          occurrence.status,
                        )}`}
                      >
                        {statusLabel(occurrence.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      <details className="max-w-[260px] text-[11px] text-slate-500">
                        <summary className="cursor-pointer font-semibold text-slate-600">
                          Ver descrição
                        </summary>
                        <p className="mt-1 leading-5">{occurrence.description}</p>
                      </details>
                    </td>

                    <td className="px-3 py-2 align-top text-slate-700">
                      {occurrence.resolution_notes ? (
                        <details className="max-w-[260px] text-[11px] text-slate-500">
                          <summary className="cursor-pointer font-semibold text-slate-600">
                            Ver conclusão
                          </summary>
                          <p className="mt-1 leading-5">
                            {occurrence.resolution_notes}
                          </p>
                          {occurrence.resolved_at && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              Resolvida em {formatDate(occurrence.resolved_at)}
                            </p>
                          )}
                        </details>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700">
                          Aguardando providência
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
          Esta tela é de acompanhamento da Coordenadoria. Ações de ciência, providência administrativa e comunicação formal poderão ser implementadas depois.
        </div>
      </section>
    </SystemShell>
  );
}
