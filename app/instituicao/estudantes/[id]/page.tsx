import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { getInstitutionStudentDetail } from "@/lib/queries/institution-student-detail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: string | null) {
  if (!value) return "-";

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

function Badge({ status, children }: { status: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClass(
        status,
      )}`}
    >
      {children}
    </span>
  );
}

export default async function InstituicaoEstudanteHistoricoPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { detail, error } = await getInstitutionStudentDetail(id);

  if (!detail && !error) {
    notFound();
  }

  const pendingOccurrences =
    detail?.occurrences.filter((item) => item.status === "pendente").length ?? 0;

  const resolvedOccurrences =
    detail?.occurrences.filter((item) => item.status === "resolvida").length ?? 0;

  return (
    <SystemShell
      areaLabel="Instituição de Ensino"
      title="Histórico do estágio"
      description="Consulta consolidada do estágio para acompanhamento da instituição de ensino."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/instituicao/estudantes"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para estudantes
        </Link>

        {detail && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/instituicao/estudantes"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
            >
              Lista de estudantes
            </Link>
          </div>
        )}
      </div>

      {error && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {detail && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Estudante
                </p>
                <h2 className="text-lg font-black text-slate-950">
                  {detail.student_name}
                </h2>
                <p className="text-xs text-slate-500">
                  {detail.student_email ?? "E-mail não informado"}
                </p>
              </div>

              <Badge status={detail.status}>
                {internshipStatusLabel(detail.status)}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto border-b border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="w-44 bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Instituição
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {detail.institution_name}
                  </td>

                  <th className="w-36 bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Curso
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {detail.course_name}
                  </td>
                </tr>

                <tr className="border-b border-slate-100">
                  <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Unidade
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {detail.municipal_unit_name}
                  </td>

                  <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Supervisor
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {detail.supervisor_name}
                  </td>
                </tr>

                <tr>
                  <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Período
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {formatDate(detail.start_date)} a {formatDate(detail.end_date)}
                  </td>

                  <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                    Horário
                  </th>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {detail.schedule ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto border-b border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-black">Resumo do acompanhamento</th>
                  <th className="px-4 py-2 font-black">Autorização</th>
                  <th className="px-4 py-2 font-black">Ocorrências</th>
                  <th className="px-4 py-2 font-black">Relatório final</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {internshipStatusLabel(detail.status)}
                  </td>

                  <td className="px-4 py-2 text-slate-700">
                    {detail.authorization
                      ? `Emitida em ${formatDate(detail.authorization.created_at)}`
                      : "Não localizada"}
                  </td>

                  <td className="px-4 py-2 text-slate-700">
                    {detail.occurrences.length} registro(s), {pendingOccurrences} pendente(s),{" "}
                    {resolvedOccurrences} resolvida(s)
                  </td>

                  <td className="px-4 py-2 text-slate-700">
                    {detail.final_report
                      ? `${closingStatusLabel(detail.final_report.closing_status)} • ${
                          detail.final_report.completed_workload ?? "-"
                        }h`
                      : "Pendente"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <details className="border-b border-slate-200">
            <summary className="cursor-pointer bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50">
              Autorização de início
            </summary>

            {detail.authorization ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-black">Status</th>
                      <th className="px-4 py-2 font-black">Período autorizado</th>
                      <th className="px-4 py-2 font-black">Horário</th>
                      <th className="px-4 py-2 font-black">Emissão</th>
                      <th className="px-4 py-2 font-black">Observações</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-2 align-top">
                        <Badge status={detail.authorization.status}>
                          {detail.authorization.status === "autorizado"
                            ? "Autorizado"
                            : detail.authorization.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-2 align-top font-semibold text-slate-800">
                        {formatDate(detail.authorization.authorized_start_date)} a{" "}
                        {formatDate(detail.authorization.authorized_end_date)}
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        {detail.authorization.authorized_schedule ?? "-"}
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        {formatDate(detail.authorization.created_at)}
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        {detail.authorization.notes ?? "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-600">
                Autorização não localizada.
              </div>
            )}
          </details>

          <details className="border-b border-slate-200" open>
            <summary className="cursor-pointer bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50">
              Ocorrências
            </summary>

            {detail.occurrences.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-600">
                Nenhuma ocorrência registrada para este estágio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-black">Tipo</th>
                      <th className="px-4 py-2 font-black">Data</th>
                      <th className="px-4 py-2 font-black">Status</th>
                      <th className="px-4 py-2 font-black">Descrição</th>
                      <th className="px-4 py-2 font-black">Conclusão</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {detail.occurrences.map((occurrence) => (
                      <tr key={occurrence.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 align-top font-semibold text-slate-800">
                          {occurrenceTypeLabel(occurrence.occurrence_type)}
                        </td>

                        <td className="px-4 py-2 align-top text-slate-700">
                          {formatDate(occurrence.occurrence_date)}
                        </td>

                        <td className="px-4 py-2 align-top">
                          <Badge status={occurrence.status}>
                            {occurrenceStatusLabel(occurrence.status)}
                          </Badge>
                        </td>

                        <td className="px-4 py-2 align-top text-slate-700">
                          <details>
                            <summary className="cursor-pointer font-semibold text-teal-700">
                              Ver
                            </summary>
                            <p className="mt-1 max-w-[480px] leading-5">
                              {occurrence.description}
                            </p>
                          </details>
                        </td>

                        <td className="px-4 py-2 align-top text-slate-700">
                          {occurrence.resolution_notes ? (
                            <details>
                              <summary className="cursor-pointer font-semibold text-teal-700">
                                Ver
                              </summary>
                              <p className="mt-1 max-w-[480px] leading-5">
                                {occurrence.resolution_notes}
                              </p>
                            </details>
                          ) : (
                            "Pendente"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </details>

          <details open>
            <summary className="cursor-pointer bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-50">
              Relatório final
            </summary>

            {detail.final_report ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-black">Situação</th>
                      <th className="px-4 py-2 font-black">Período realizado</th>
                      <th className="px-4 py-2 font-black">Carga</th>
                      <th className="px-4 py-2 font-black">Registro</th>
                      <th className="px-4 py-2 font-black">Resumo</th>
                      <th className="px-4 py-2 font-black">Observações</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="px-4 py-2 align-top">
                        <Badge status={detail.final_report.closing_status}>
                          {closingStatusLabel(detail.final_report.closing_status)}
                        </Badge>
                      </td>

                      <td className="px-4 py-2 align-top font-semibold text-slate-800">
                        {detail.final_report.performed_period}
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        {detail.final_report.completed_workload ?? "-"}h
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        {formatDate(detail.final_report.created_at)}
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        <details>
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Ver
                          </summary>
                          <p className="mt-1 max-w-[480px] leading-5">
                            {detail.final_report.activities_summary}
                          </p>
                        </details>
                      </td>

                      <td className="px-4 py-2 align-top text-slate-700">
                        <details>
                          <summary className="cursor-pointer font-semibold text-teal-700">
                            Ver
                          </summary>
                          <p className="mt-1 max-w-[480px] leading-5">
                            {detail.final_report.supervisor_notes ??
                              "Sem observações."}
                          </p>
                        </details>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Ainda não há relatório final registrado para este estágio.
                </p>

                <span className="w-fit rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                  Aguardando registro pela unidade
                </span>
              </div>
            )}
          </details>
        </section>
      )}
    </SystemShell>
  );
}
