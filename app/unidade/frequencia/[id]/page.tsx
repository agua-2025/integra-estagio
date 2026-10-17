import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/system/SystemShell";
import { createClient } from "@/lib/supabase/server";
import { saveUnitAttendance } from "../actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    erro?: string;
    sucesso?: string;
    editar?: string;
  }>;
};

const statusNames: Record<string, string> = {
  presenca: "Presença",
  presenca_parcial: "Presença parcial",
  falta: "Falta",
  falta_justificada: "Falta justificada",
};

function dateBR(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function hours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export default async function UnitAttendanceDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <SystemShell
        areaLabel="Unidade Municipal"
        title="Frequência"
        description="Acesso restrito."
      >
        <p className="text-sm text-red-700">Usuário não autenticado.</p>
      </SystemShell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, municipal_unit_id")
    .eq("id", auth.user.id)
    .single();

  if (
    !profile ||
    !profile.is_active ||
    profile.role !== "unidade" ||
    !profile.municipal_unit_id
  ) {
    return (
      <SystemShell
        areaLabel="Unidade Municipal"
        title="Frequência"
        description="Acesso restrito."
      >
        <p className="text-sm text-red-700">Acesso não autorizado.</p>
      </SystemShell>
    );
  }

  const { data: internship, error: internshipError } = await supabase
    .from("internships")
    .select(
      "id, student_id, municipal_unit_id, supervisor_name, start_date, end_date, schedule, status, authorization_id"
    )
    .eq("id", id)
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .single();

  if (internshipError || !internship) notFound();

  const [studentResult, recordsResult, authorizationResult] =
    await Promise.all([
      supabase
        .from("students")
        .select("full_name")
        .eq("id", internship.student_id)
        .single(),

      supabase
        .from("internship_attendance")
        .select(
          "id, attendance_date, attendance_status, start_time, end_time, break_minutes, duration_minutes, notes, correction_reason, updated_at"
        )
        .eq("internship_id", id)
        .eq("municipal_unit_id", profile.municipal_unit_id)
        .order("attendance_date", { ascending: false })
        .limit(300),

      supabase
        .from("internship_authorizations")
        .select(
          "presentation_id, authorized_start_date, authorized_end_date, status"
        )
        .eq("id", internship.authorization_id)
        .single(),
    ]);

  const records = recordsResult.data ?? [];
  const editing = records.find((item) => item.id === query.editar);
  const totalMinutes = records.reduce(
    (sum, item) => sum + (item.duration_minutes ?? 0),
    0
  );

  let scheduledDays: string[] = [];
  let plannedStart = "";
  let plannedEnd = "";
  let plannedBreak = 0;
  let scheduleError = "";

  if (authorizationResult.data?.presentation_id) {
    const { data: term, error: termError } = await supabase
      .from("commitment_terms")
      .select(
        "weekly_days, daily_start_time, daily_end_time, break_minutes"
      )
      .eq("presentation_id", authorizationResult.data.presentation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (termError) scheduleError = termError.message;

    scheduledDays = term?.weekly_days ?? [];
    plannedStart = term?.daily_start_time?.slice(0, 5) ?? "";
    plannedEnd = term?.daily_end_time?.slice(0, 5) ?? "";
    plannedBreak = term?.break_minutes ?? 0;
  }

  const { data: historyData, error: historyError } = await supabase
    .from("internship_attendance_history")
    .select(
      "id, attendance_id, changed_at, changed_by, correction_reason, previous_record, new_record"
    )
    .eq("internship_id", id)
    .eq("municipal_unit_id", profile.municipal_unit_id)
    .order("changed_at", { ascending: false })
    .limit(200);

  const history = historyData ?? [];

  const responsibleIds = Array.from(
    new Set(
      history
        .map((item) => item.changed_by)
        .filter((value): value is string => Boolean(value))
    )
  );

  const { data: responsibleProfiles } = responsibleIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", responsibleIds)
    : { data: [] };

  const responsibleNames = new Map(
    (responsibleProfiles ?? []).map((item) => [
      item.id,
      item.full_name,
    ])
  );
  const canWrite =
    internship.status === "em_andamento" &&
    authorizationResult.data?.status === "autorizado" &&
    scheduledDays.length > 0;

  const selectedStatus = editing?.attendance_status ?? "presenca";

  return (
    <SystemShell
      areaLabel="Unidade Municipal"
      title="Frequência do estágio"
      description="Lançamento pela unidade responsável, com cálculo automático e histórico de correções."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/unidade/frequencia"
          className="text-sm font-bold text-teal-700 hover:underline"
        >
          Voltar para frequência
        </Link>
        <Link
          href={`/unidade/estagiarios/${id}`}
          className="text-xs font-bold text-slate-700 hover:text-teal-700"
        >
          Histórico do estágio
        </Link>
      </div>

      {query.erro && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {query.erro}
        </p>
      )}

      {query.sucesso && (
        <p className="mb-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
          {query.sucesso}
        </p>
      )}

      {recordsResult.error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {recordsResult.error.message}
        </p>
      )}

      {scheduleError && (
        <p className="mb-3 text-sm text-red-700">{scheduleError}</p>
      )}

      <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-base font-black text-slate-900">
            {studentResult.data?.full_name ?? "Estudante"}
          </h2>
          <p className="text-xs text-slate-600">
            Supervisor: {internship.supervisor_name || "-"}
          </p>
        </div>

        <div className="grid gap-3 px-4 py-3 text-xs sm:grid-cols-3">
          <div>
            <p className="font-bold uppercase text-slate-500">Período</p>
            <p className="mt-1 font-semibold text-slate-800">
              {dateBR(internship.start_date)} a {dateBR(internship.end_date)}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase text-slate-500">Jornada prevista</p>
            <p className="mt-1 font-semibold text-slate-800">
              {plannedStart || "-"} às {plannedEnd || "-"}
              {scheduledDays.length > 0 && ` • intervalo ${plannedBreak} min`}
            </p>
            <p className="mt-1 text-slate-500">
              {scheduledDays.join(", ")}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase text-slate-500">
              Horas registradas
            </p>
            <p className="mt-1 text-lg font-black text-teal-800">
              {hours(totalMinutes)}
            </p>
            <p className="text-slate-500">
              {records.length} lançamento(s) consultado(s)
            </p>
          </div>
        </div>
      </section>

      {canWrite ? (
        <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-black text-slate-900">
              {editing ? "Corrigir frequência" : "Novo lançamento"}
            </h2>
            {editing && (
              <Link
                href={`/unidade/frequencia/${id}`}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Cancelar correção
              </Link>
            )}
          </div>

          <form action={saveUnitAttendance} className="p-4">
            <input type="hidden" name="internship_id" value={id} />
            <input
              type="hidden"
              name="record_id"
              value={editing?.id ?? ""}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-bold text-slate-700">
                Data *
                <input
                  key={editing?.id ?? "new-date"}
                  type="date"
                  name="attendance_date"
                  required
                  readOnly={!!editing}
                  defaultValue={editing?.attendance_date ?? ""}
                  min={
                    authorizationResult.data?.authorized_start_date ??
                    internship.start_date
                  }
                  max={
                    authorizationResult.data?.authorized_end_date ??
                    internship.end_date ??
                    undefined
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                />
              </label>

              <label className="text-xs font-bold text-slate-700">
                Situação *
                <select
                  key={editing?.id ?? "new-status"}
                  name="attendance_status"
                  required
                  defaultValue={selectedStatus}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                >
                  <option value="presenca">Presença</option>
                  <option value="presenca_parcial">Presença parcial</option>
                  <option value="falta">Falta</option>
                  <option value="falta_justificada">Falta justificada</option>
                </select>
              </label>

              <label className="text-xs font-bold text-slate-700">
                Intervalo realizado (minutos)
                <input
                  key={editing?.id ?? "new-break"}
                  type="number"
                  name="break_minutes"
                  min="0"
                  max={plannedBreak}
                  defaultValue={
                    editing?.break_minutes ?? plannedBreak
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                />
              </label>

              <label className="text-xs font-bold text-slate-700">
                Entrada
                <input
                  key={editing?.id ?? "new-start"}
                  type="time"
                  name="start_time"
                  defaultValue={
                    editing?.start_time?.slice(0, 5) ??
                    plannedStart
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                />
              </label>

              <label className="text-xs font-bold text-slate-700">
                Saída
                <input
                  key={editing?.id ?? "new-end"}
                  type="time"
                  name="end_time"
                  defaultValue={
                    editing?.end_time?.slice(0, 5) ??
                    plannedEnd
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                />
              </label>

              <label className="text-xs font-bold text-slate-700 sm:col-span-3">
                Observações / justificativa da falta
                <textarea
                  key={editing?.id ?? "new-notes"}
                  name="notes"
                  rows={2}
                  defaultValue={editing?.notes ?? ""}
                  placeholder="Obrigatório para falta justificada."
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </label>

              {editing && (
                <label className="text-xs font-bold text-slate-700 sm:col-span-3">
                  Motivo da correção *
                  <textarea
                    name="correction_reason"
                    rows={2}
                    required
                    placeholder="Descreva o motivo da alteração. A versão anterior será preservada no histórico."
                    className="mt-1 block w-full rounded-lg border border-amber-300 p-2 text-sm"
                  />
                </label>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              As horas serão calculadas pelo banco conforme entrada,
              saída e intervalo. Para faltas, os horários serão ignorados.
              Apenas dias previstos no Termo podem ser lançados.
            </p>

            <button
              type="submit"
              className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-xs font-black text-white hover:bg-teal-800"
            >
              {editing ? "Salvar correção" : "Registrar frequência"}
            </button>
          </form>
        </section>
      ) : (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          O lançamento está indisponível: o estágio precisa estar em
          andamento, autorizado e com jornada definida.
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">
            Frequências registradas
          </h2>
        </div>

        {records.length === 0 ? (
          <p className="px-4 py-4 text-sm text-slate-600">
            Nenhuma frequência lançada. Os dias ainda não registrados
            permanecem pendentes, não são considerados faltas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Saída</th>
                  <th className="px-4 py-3">Intervalo</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {dateBR(record.attendance_date)}
                    </td>
                    <td className="px-4 py-3">
                      {statusNames[record.attendance_status] ??
                        record.attendance_status}
                      {record.notes && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-teal-700">
                            Observação
                          </summary>
                          <p className="max-w-xs py-1 text-slate-600">
                            {record.notes}
                          </p>
                        </details>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.start_time?.slice(0, 5) ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {record.end_time?.slice(0, 5) ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {record.break_minutes} min
                    </td>
                    <td className="px-4 py-3 font-black text-slate-800">
                      {hours(record.duration_minutes)}
                    </td>
                    <td className="px-4 py-3">
                      {canWrite ? (
                        <Link
                          href={`/unidade/frequencia/${id}?editar=${record.id}`}
                          className="font-bold text-teal-700 hover:underline"
                        >
                          Corrigir
                        </Link>
                      ) : (
                        <span className="text-slate-400">Consulta</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-black text-slate-900">
            Histórico de correções
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Registro permanente das alterações realizadas nas frequências.
          </p>
        </div>

        {historyError ? (
          <p className="px-4 py-3 text-sm text-red-700">
            {historyError.message}
          </p>
        ) : history.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-600">
            Nenhuma correção registrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Alteração</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Data da frequência</th>
                  <th className="px-4 py-3">Antes</th>
                  <th className="px-4 py-3">Depois</th>
                  <th className="px-4 py-3">Justificativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((entry) => {
                  const previous = entry.previous_record as {
                    attendance_date?: string;
                    attendance_status?: string;
                    start_time?: string | null;
                    end_time?: string | null;
                    duration_minutes?: number;
                  };

                  const current = entry.new_record as {
                    attendance_status?: string;
                    start_time?: string | null;
                    end_time?: string | null;
                    duration_minutes?: number;
                  };

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(entry.changed_at).toLocaleString(
                          "pt-BR",
                          { timeZone: "America/Cuiaba" }
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {responsibleNames.get(entry.changed_by ?? "") ??
                          "Usuário não identificado"}
                      </td>
                      <td className="px-4 py-3">
                        {dateBR(previous.attendance_date ?? "")}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>
                          {statusNames[previous.attendance_status ?? ""] ??
                            previous.attendance_status ?? "-"}
                        </div>
                        <div>
                          {previous.start_time?.slice(0, 5) ?? "-"}
                          {" às "}
                          {previous.end_time?.slice(0, 5) ?? "-"}
                        </div>
                        <strong>
                          {hours(previous.duration_minutes ?? 0)}
                        </strong>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>
                          {statusNames[current.attendance_status ?? ""] ??
                            current.attendance_status ?? "-"}
                        </div>
                        <div>
                          {current.start_time?.slice(0, 5) ?? "-"}
                          {" às "}
                          {current.end_time?.slice(0, 5) ?? "-"}
                        </div>
                        <strong className="text-teal-800">
                          {hours(current.duration_minutes ?? 0)}
                        </strong>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-700">
                        {entry.correction_reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SystemShell>
  );
}

