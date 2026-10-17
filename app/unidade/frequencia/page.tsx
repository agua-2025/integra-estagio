import Link from "next/link";
import { SystemShell } from "@/components/system/SystemShell";
import { getUnitInternsData } from "@/lib/queries/unit-interns";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h${String(remaining).padStart(2, "0")}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    aguardando_inicio: "Aguardando início",
    em_andamento: "Em andamento",
    suspenso: "Suspenso",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };
  return labels[status] ?? status;
}

export default async function UnidadeFrequenciaPage() {
  const { unit, interns, error } = await getUnitInternsData();
  const ids = interns.map((item) => item.id);

  const supabase = await createClient();

  const result = !error && unit && ids.length > 0
    ? await supabase
        .from("internship_attendance")
        .select(
          "id, internship_id, attendance_status, duration_minutes"
        )
        .eq("municipal_unit_id", unit.id)
        .in("internship_id", ids)
    : { data: [], error: null };

  const attendanceError = result.error?.message ?? null;

  const attendance = attendanceError ? [] : result.data ?? [];

  const summaries = new Map<string, {
    minutes: number;
    presences: number;
    absences: number;
    total: number;
  }>();

  for (const row of attendance) {
    const current = summaries.get(row.internship_id) ?? {
      minutes: 0,
      presences: 0,
      absences: 0,
      total: 0,
    };

    current.minutes += Number(row.duration_minutes ?? 0);
    current.total += 1;

    if (
      row.attendance_status === "presenca" ||
      row.attendance_status === "presenca_parcial"
    ) {
      current.presences += 1;
    }

    if (
      row.attendance_status === "falta" ||
      row.attendance_status === "falta_justificada"
    ) {
      current.absences += 1;
    }

    summaries.set(row.internship_id, current);
  }

  const totalMinutes = Array.from(summaries.values())
    .reduce((sum, item) => sum + item.minutes, 0);

  const totalAbsences = Array.from(summaries.values())
    .reduce((sum, item) => sum + item.absences, 0);

  const activeInterns = interns.filter(
    (item) => item.status === "em_andamento"
  ).length;

  const indicators = [
    { label: "Estágios em andamento", value: activeInterns },
    { label: "Lançamentos registrados", value: attendance.length },
    { label: "Horas registradas", value: formatMinutes(totalMinutes) },
    { label: "Faltas registradas", value: totalAbsences },
  ];

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Controle de Frequência"
      description="Consulte os lançamentos de frequência dos estagiários vinculados à unidade municipal."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/unidade"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Voltar ao painel
        </Link>

        <Link
          href="/unidade/estagiarios"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"
        >
          Ver estagiários
        </Link>
      </div>

      {(error || attendanceError) && (
        <section className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os dados de frequência: {error ?? attendanceError}
        </section>
      )}

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-base font-bold text-slate-900">
            Frequência por estagiário
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Unidade: {unit?.name ?? "Não identificada"}
          </p>
        </div>

        {error || attendanceError ? (
          <div className="px-4 py-5 text-sm text-slate-600">
            A listagem não pode ser apresentada enquanto houver erro na consulta.
          </div>
        ) : interns.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">
            Nenhum estágio vinculado a esta unidade.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Estagiário</th>
                  <th className="px-3 py-3 font-semibold">Curso</th>
                  <th className="px-3 py-3 font-semibold">Supervisor</th>
                  <th className="px-3 py-3 font-semibold">Situação</th>
                  <th className="px-3 py-3 font-semibold">Registros</th>
                  <th className="px-3 py-3 font-semibold">Faltas</th>
                  <th className="px-3 py-3 font-semibold">Horas</th>
                  <th className="px-3 py-3 text-right font-semibold">Ação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {interns.map((intern) => {
                  const summary = summaries.get(intern.id) ?? {
                    minutes: 0,
                    presences: 0,
                    absences: 0,
                    total: 0,
                  };

                  return (
                    <tr key={intern.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {intern.student_name}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {intern.course_name}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {intern.supervisor_name}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {statusLabel(intern.status)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {summary.total}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {summary.absences}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {formatMinutes(summary.minutes)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/unidade/estagiarios/${intern.id}`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-800"
                        >
                          Ver estágio
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Os totais refletem os lançamentos disponíveis no controle de frequência.
        Dias ainda não registrados não são contabilizados como faltas.
        O lançamento e a correção de frequência serão habilitados após a
        validação das regras de jornada e segurança.
      </p>
    </SystemShell>
  );
}
