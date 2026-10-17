import { calculateInternshipProjection } from "@/lib/attendance-projection";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createUnitFinalReport } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { getUnitFinalReportDetail } from "@/lib/queries/unit-final-reports";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    erro?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function formatDate(value: string | null) {
  if (!value) return "-";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function defaultPeriod(startDate: string, endDate: string | null) {
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

export default async function UnidadeRelatorioFinalDetalhePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const { detail, error } = await getUnitFinalReportDetail(id);

  if (!detail && !error) {
    notFound();
  }

  const supabase = await createClient();

  const { data: workloadData, error: workloadError } = detail
    ? await supabase.rpc("get_unit_closure_workload", {
        p_internship_id: detail.id,
      })
    : { data: null, error: null };

  const attendanceWorkload = workloadData?.[0] ?? null;
  const completedMinutes = Number(
    attendanceWorkload?.completed_minutes ?? 0
  );
  const requiredHours = Number(
    attendanceWorkload?.required_hours ?? 0
  );
  const completedHoursText =
    `${Math.floor(completedMinutes / 60)}h${String(
      completedMinutes % 60
    ).padStart(2, "0")}`;
  const requiredMinutes = requiredHours * 60;
  const remainingMinutes = Math.max(
    0,
    requiredMinutes - completedMinutes
  );

  const workloadProgressPercent =
    requiredMinutes > 0
      ? Math.min(100, (completedMinutes / requiredMinutes) * 100)
      : 0;

  const remainingHoursText =
    `${Math.floor(remainingMinutes / 60)}h${String(
      remainingMinutes % 60
    ).padStart(2, "0")}`;
  const { data: projectionInternship } = detail
    ? await supabase
        .from("internships")
        .select("municipal_unit_id, authorization_id")
        .eq("id", detail.id)
        .single()
    : { data: null };

  const { data: projectionAuthorization } =
    projectionInternship
      ? await supabase
          .from("internship_authorizations")
          .select("presentation_id")
          .eq("id", projectionInternship.authorization_id)
          .single()
      : { data: null };

  const [projectionTermResult, calendarResult] =
    await Promise.all([
      projectionAuthorization
        ? supabase
            .from("commitment_terms")
            .select(
              "weekly_days, daily_start_time, daily_end_time, break_minutes"
            )
            .eq("presentation_id", projectionAuthorization.presentation_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),

      projectionInternship
        ? supabase
            .from("unit_calendar_exceptions")
            .select("start_date, end_date")
            .or(
              `municipal_unit_id.is.null,municipal_unit_id.eq.${projectionInternship.municipal_unit_id}`
            )
        : Promise.resolve({ data: [], error: null }),
    ]);

  const projectionTerm = projectionTermResult.data;
  const projectionErrors =
    projectionTermResult.error?.message ??
    calendarResult.error?.message ??
    null;

  const timeToMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };

  const dailyMinutes = projectionTerm
    ? timeToMinutes(projectionTerm.daily_end_time) -
      timeToMinutes(projectionTerm.daily_start_time) -
      Number(projectionTerm.break_minutes ?? 0)
    : 0;

  const todayCuiaba = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Cuiaba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const internshipProjection =
    detail &&
    attendanceWorkload &&
    projectionTerm &&
    !projectionErrors
      ? calculateInternshipProjection({
          startDate: detail.start_date,
          endDate: detail.end_date ?? detail.start_date,
          weeklyDays: projectionTerm.weekly_days ?? [],
          dailyMinutes,
          completedMinutes,
          requiredMinutes: requiredHours * 60,
          exceptions: calendarResult.data ?? [],
          today: todayCuiaba,
        })
      : null;

  const formatMinutes = (value: number) =>
    `${Math.floor(value / 60)}h${String(
      value % 60
    ).padStart(2, "0")}`;
  const canCreateReport =
    detail &&
    !detail.report &&
    ["em_andamento", "suspenso"].includes(detail.status);

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Relatório final"
      description="Registre ou consulte o encerramento do estágio selecionado."
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/unidade/relatorio-final"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar para relatórios finais
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {query?.erro && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(query.erro)}
        </section>
      )}

      {error && (
        <section className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </section>
      )}

      {detail && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 border-b border-slate-200 md:grid-cols-4">
            <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Estudante
              </p>
              <p className="text-sm font-black text-slate-950">
                {detail.student_name}
              </p>
              {detail.student_email && (
                <p className="text-[11px] text-slate-500">{detail.student_email}</p>
              )}
            </div>

            <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Instituição / curso
              </p>
              <p className="text-sm font-bold text-slate-900">
                {detail.institution_name}
              </p>
              <p className="text-[11px] text-slate-500">{detail.course_name}</p>
            </div>

            <div className="border-b border-slate-100 px-4 py-2 md:border-b-0 md:border-r">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Supervisor
              </p>
              <p className="text-sm font-bold text-slate-900">
                {detail.supervisor_name}
              </p>
              <p className="text-[11px] text-slate-500">
                {detail.schedule ?? "Horário não informado"}
              </p>
            </div>

            <div className="px-4 py-2">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Situação
              </p>
              <p className="text-sm font-bold text-slate-900">
                {internshipStatusLabel(detail.status)}
              </p>
              <p className="text-[11px] text-slate-500">
                {formatDate(detail.start_date)} a {formatDate(detail.end_date)}
              </p>
            </div>
          </div>

          {!detail.report && (
            <div className="border-b border-slate-200 bg-white px-4 py-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">
                  Cumprimento da carga horária
                </h2>
                <span className="text-xs font-bold text-teal-800">
                  {workloadProgressPercent.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}% concluído
                </span>
              </div>

              {workloadError || !attendanceWorkload ? (
                <p className="text-sm font-semibold text-red-700">
                  Não foi possível consultar a carga horária.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex items-baseline gap-2">
                    <strong className="text-2xl font-black text-teal-800">
                      {completedHoursText}
                    </strong>
                    <span className="text-sm font-semibold text-slate-600">
                      de {requiredHours}h exigidas
                    </span>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={workloadProgressPercent}
                    aria-label="Progresso da carga horária"
                  >
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{
                        width: `${workloadProgressPercent}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    {remainingMinutes > 0
                      ? `Faltam ${remainingHoursText} para completar a carga horária obrigatória.`
                      : "Carga horária obrigatória atingida."}
                  </p>
                </>
              )}
            </div>
          )}
          {!detail.report && (
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="mb-2 text-sm font-black uppercase text-slate-800">
                Previsão de conclusão
              </h2>

              {projectionErrors ? (
                <p className="text-xs text-red-700">
                  Não foi possível consultar o calendário:
                  {" "}{projectionErrors}
                </p>
              ) : !internshipProjection ||
                internshipProjection.insufficientSchedule ? (
                <p className="text-xs text-amber-800">
                  Não há dados suficientes para calcular a previsão.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 text-xs sm:grid-cols-3">
                    <div>
                      <p className="font-bold text-slate-500">
                        Horas ainda disponíveis no prazo
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {formatMinutes(
                          internshipProjection.availableMinutes
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Dias programados restantes
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {internshipProjection.availableDays}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        {internshipProjection.needsExtension
                          ? "Projeção condicionada à prorrogação"
                          : "Conclusão estimada"}
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {internshipProjection.projectedDate
                          ? formatDate(internshipProjection.projectedDate)
                          : "Indeterminada"}
                      </p>
                      {internshipProjection.needsExtension && (
                        <p className="mt-1 text-[11px] font-semibold text-amber-800">
                          Data simulada, não autorizada.
                        </p>
                      )}
                    </div>
                  </div>

                  {internshipProjection.needsExtension && (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                      A carga horária restante não poderá ser cumprida
                      dentro do período autorizado, considerando a
                      jornada e o calendário cadastrados.
                      É necessário avaliar a regularização ou
                      prorrogação formal do estágio.
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-slate-500">
                    Estimativa baseada na jornada prevista, nas horas
                    registradas e nos dias disponíveis. Não altera
                    automaticamente o Termo de Compromisso.
                  </p>
                </>
              )}
            </div>
          )}
          {detail.report ? (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                    Relatório registrado
                  </h2>
                  <p className="text-xs text-slate-500">
                    Este estágio já possui relatório final.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800 ring-1 ring-teal-200">
                  {closingStatusLabel(detail.report.closing_status)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <th className="w-[160px] bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                        Período realizado
                      </th>
                      <td className="px-4 py-2 font-semibold text-slate-800">
                        {detail.report.performed_period}
                      </td>
                      <th className="w-[140px] bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                        Carga cumprida
                      </th>
                      <td className="px-4 py-2 font-semibold text-slate-800">
                        {detail.report.completed_workload ?? "-"}h
                      </td>
                    </tr>

                    <tr>
                      <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                        Resumo das atividades
                      </th>
                      <td className="break-words whitespace-normal px-4 py-2 leading-5 text-slate-700" colSpan={3}>
                        {detail.report.activities_summary}
                      </td>
                    </tr>

                    {detail.report.supervisor_notes && (
                      <tr>
                        <th className="bg-slate-50 px-4 py-2 font-black uppercase tracking-wide text-slate-500">
                          Observações do supervisor
                        </th>
                        <td className="break-words whitespace-normal px-4 py-2 leading-5 text-slate-700" colSpan={3}>
                          {detail.report.supervisor_notes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <form action={createUnitFinalReport} className="px-4 py-4">
              <input type="hidden" name="internship_id" value={detail.id} />

              <div className="mb-3 flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">
                    Registrar relatório final
                  </h2>
                  <p className="text-xs text-slate-500">
                    O registro encerrará este estágio no âmbito da unidade.
                  </p>
                </div>
              </div>

              {!canCreateReport && (
                <section className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Este estágio não está disponível para registro de relatório final.
                </section>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1 md:col-span-1">
                  <span className="text-xs font-bold text-slate-600">
                    Período realizado
                  </span>
                  <input
                    name="performed_period"
                    required
                    defaultValue={defaultPeriod(detail.start_date, detail.end_date)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-600">
                    Situação
                  </span>
                  <select
                    name="closing_status"
                    required
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="">Selecione</option>
                    <option value="concluido">Concluído</option>
                    <option value="concluido_com_observacao">
                      Concluído com observação
                    </option>
                    <option value="encerrado_antecipadamente">
                      Encerrado antecipadamente
                    </option>
                  </select>
                </label>

                <label className="grid gap-1 md:col-span-3">
                  <span className="text-xs font-bold text-slate-600">
                    Resumo das atividades
                  </span>
                  <textarea
                    name="activities_summary"
                    rows={3}
                    required
                    placeholder="Descreva as atividades desenvolvidas pelo estudante durante o estágio."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>

                <label className="grid gap-1 md:col-span-3">
                  <span className="text-xs font-bold text-slate-600">
                    Observações do supervisor
                  </span>
                  <textarea
                    name="supervisor_notes"
                    rows={2}
                    placeholder="Informe observações, recomendações ou ressalvas, se houver."
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </label>
              </div>

              <div className="mt-3 flex justify-end border-t border-slate-200 pt-3">
                <button
                  type="submit"
                  disabled={!canCreateReport || !!workloadError || !attendanceWorkload}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Registrar relatório final
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </SystemShell>
  );
}






