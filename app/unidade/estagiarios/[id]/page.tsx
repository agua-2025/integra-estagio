import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInternDetail } from "@/lib/queries/unit-intern-detail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function internshipStatusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function occurrenceTypeLabel(type: string) {
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

function occurrenceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    resolvida: "Resolvida",
  };

  return labels[status] ?? status;
}

function closingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    concluido: "Concluído",
    concluido_com_observacao: "Concluído com observação",
    encerrado_antecipadamente: "Encerrado antecipadamente",
    pendente: "Pendente",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function badgeClass(status: string) {
  if (["em_andamento", "concluido", "resolvida", "autorizado"].includes(status)) {
    return "bg-teal-50 text-teal-800 ring-1 ring-teal-200";
  }

  if (["aguardando_inicio", "concluido_com_observacao"].includes(status)) {
    return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
  }

  if (["suspenso", "cancelado", "pendente", "encerrado_antecipadamente"].includes(status)) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default async function UnidadeEstagiarioHistoricoPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { detail, error } = await getUnitInternDetail(id);

  if (!detail && !error) {
    notFound();
  }

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Histórico do estágio"
      description="Consulte os dados do estágio, autorização, ocorrências e relatório final do estudante."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade/estagiarios"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para estagiários
        </Link>

        {detail && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/unidade/ocorrencias"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Ocorrências
            </Link>

            <Link
              href={`/unidade/relatorio-final/${detail.id}`}
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Relatório final
            </Link>
          </div>
        )}
      </div>

      {error && (
        <section className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {detail && (
        <>
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Estudante
                </p>
                <p className="mt-1 text-base font-black text-slate-950">
                  {detail.student_name}
                </p>
                <p className="text-xs text-slate-500">
                  {detail.student_email ?? "E-mail não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Instituição / Curso
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {detail.institution_name}
                </p>
                <p className="text-xs text-slate-500">{detail.course_name}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Unidade / Supervisor
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {detail.municipal_unit_name}
                </p>
                <p className="text-xs text-slate-500">{detail.supervisor_name}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Situação
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${badgeClass(
                    detail.status,
                  )}`}
                >
                  {internshipStatusLabel(detail.status)}
                </span>
              </div>
            </div>
          </section>

          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Início
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(detail.start_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Término
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(detail.end_date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Horário
              </p>
              <p className="text-sm font-bold text-slate-900">
                {detail.schedule ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Ocorrências
              </p>
              <p className="text-sm font-bold text-slate-900">
                {detail.occurrences.length}
              </p>
            </div>
          </div>

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Autorização de início
              </h2>
            </div>

            {detail.authorization ? (
              <div className="grid gap-4 p-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-black ${badgeClass(
                      detail.authorization.status,
                    )}`}
                  >
                    {detail.authorization.status === "autorizado"
                      ? "Autorizado"
                      : detail.authorization.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Período autorizado
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(detail.authorization.authorized_start_date)} a{" "}
                    {formatDate(detail.authorization.authorized_end_date)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Horário autorizado
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {detail.authorization.authorized_schedule ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Emitida em
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(detail.authorization.created_at)}
                  </p>
                </div>

                {detail.authorization.notes && (
                  <div className="md:col-span-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Observações da autorização
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {detail.authorization.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-600">
                Autorização não localizada.
              </div>
            )}
          </section>

          <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Ocorrências
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Registros lançados pela unidade durante o acompanhamento.
              </p>
            </div>

            {detail.occurrences.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">
                Nenhuma ocorrência registrada para este estágio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-black">Tipo</th>
                      <th className="px-3 py-2 font-black">Data</th>
                      <th className="px-3 py-2 font-black">Status</th>
                      <th className="px-3 py-2 font-black">Descrição</th>
                      <th className="px-3 py-2 font-black">Conclusão</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {detail.occurrences.map((occurrence) => (
                      <tr key={occurrence.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 align-top font-semibold text-slate-800">
                          {occurrenceTypeLabel(occurrence.occurrence_type)}
                        </td>

                        <td className="px-3 py-2 align-top text-slate-700">
                          {formatDate(occurrence.occurrence_date)}
                        </td>

                        <td className="px-3 py-2 align-top">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClass(
                              occurrence.status,
                            )}`}
                          >
                            {occurrenceStatusLabel(occurrence.status)}
                          </span>
                        </td>

                        <td className="px-3 py-2 align-top text-slate-700">
                          <details className="max-w-[280px] text-[11px] text-slate-500">
                            <summary className="cursor-pointer font-semibold text-slate-600">
                              Ver descrição
                            </summary>
                            <p className="mt-1 leading-5">
                              {occurrence.description}
                            </p>
                          </details>
                        </td>

                        <td className="px-3 py-2 align-top text-slate-700">
                          {occurrence.resolution_notes ? (
                            <details className="max-w-[280px] text-[11px] text-slate-500">
                              <summary className="cursor-pointer font-semibold text-slate-600">
                                Ver conclusão
                              </summary>
                              <p className="mt-1 leading-5">
                                {occurrence.resolution_notes}
                              </p>
                            </details>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700">
                              Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                Relatório final
              </h2>
            </div>

            {detail.final_report ? (
              <div className="p-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${badgeClass(
                      detail.final_report.closing_status,
                    )}`}
                  >
                    {closingStatusLabel(detail.final_report.closing_status)}
                  </span>

                  <p className="text-xs font-semibold text-slate-500">
                    Registrado em {formatDate(detail.final_report.created_at)}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Período realizado
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {detail.final_report.performed_period}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Carga cumprida
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {detail.final_report.completed_workload ?? "-"}h
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Resumo das atividades
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {detail.final_report.activities_summary}
                  </p>
                </div>

                {detail.final_report.supervisor_notes && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Observações do supervisor
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {detail.final_report.supervisor_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Ainda não há relatório final registrado para este estágio.
                </p>

                <Link
                  href={`/unidade/relatorio-final/${detail.id}`}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Registrar relatório final
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </SystemShell>
  );
}
