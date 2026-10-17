import { createClient } from "@/lib/supabase/server";
import {
  calculateAuthorizationPlan,
  formatPlanningMinutes,
} from "@/lib/authorization-planning";

type Props = {
  presentationId: string;
};

export async function PlanningStatus({ presentationId }: Props) {
  const supabase = await createClient();

  const { data: presentation, error: presentationError } =
    await supabase
      .from("student_presentations")
      .select("municipal_unit_id, required_workload")
      .eq("id", presentationId)
      .single();

  if (presentationError || !presentation?.municipal_unit_id) {
    return (
      <p className="text-xs font-semibold text-red-700">
        Planejamento indisponível: apresentação ou unidade não localizada.
      </p>
    );
  }

  const [termResult, calendarResult] = await Promise.all([
    supabase
      .from("commitment_terms")
      .select(
        "internship_start_date, internship_end_date, weekly_days, daily_start_time, daily_end_time, break_minutes, required_workload"
      )
      .eq("presentation_id", presentationId)
      .eq("status", "validado")
      .maybeSingle(),

    supabase
      .from("unit_calendar_exceptions")
      .select("start_date, end_date")
      .or(
        `municipal_unit_id.is.null,municipal_unit_id.eq.${presentation.municipal_unit_id}`
      ),
  ]);

  const term = termResult.data;

  if (
    termResult.error ||
    calendarResult.error ||
    !term ||
    !term.internship_start_date ||
    !term.internship_end_date ||
    !term.daily_start_time ||
    !term.daily_end_time
  ) {
    return (
      <p className="text-xs font-semibold text-red-700">
        Não foi possível verificar o planejamento do estágio.
      </p>
    );
  }

  const plan = calculateAuthorizationPlan({
    startDate: term.internship_start_date,
    endDate: term.internship_end_date,
    weeklyDays: term.weekly_days ?? [],
    startTime: term.daily_start_time,
    endTime: term.daily_end_time,
    breakMinutes: Number(term.break_minutes ?? 0),
    requiredHours: Number(presentation.required_workload ?? 0),
    exceptions: calendarResult.data ?? [],
  });

  const shortDate = (value: string | null) =>
    value
      ? value.split("-").reverse().join("/")
      : "-";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
      <p className="mb-2 font-black uppercase text-slate-700">
        Conferência do planejamento
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-slate-500">Carga exigida</p>
          <strong>{formatPlanningMinutes(plan.requiredMinutes)}</strong>
        </div>
        <div>
          <p className="text-slate-500">Carga disponível</p>
          <strong>{formatPlanningMinutes(plan.availableMinutes)}</strong>
        </div>
        <div>
          <p className="text-slate-500">Dias previstos</p>
          <strong>{plan.scheduledDays}</strong>
        </div>
        <div>
          <p className="text-slate-500">Dias excepcionados</p>
          <strong>{plan.exceptionDays}</strong>
        </div>
      </div>

      <p className="mt-2 text-slate-600">
        Conclusão programada:{" "}
        <strong>{shortDate(plan.expectedCompletion)}</strong>
      </p>

      <p
        className={`mt-2 rounded-md px-2 py-2 font-semibold ${
          plan.valid && plan.sufficient
            ? "bg-teal-50 text-teal-800"
            : "bg-amber-50 text-amber-900"
        }`}
      >
        {!plan.valid
          ? "Jornada incompleta ou inválida. Revise o Termo."
          : plan.sufficient
          ? "Período suficiente para a carga horária programada."
          : "Período insuficiente. Revise as datas do Termo de Compromisso antes da autorização."}
      </p>
    </div>
  );
}
