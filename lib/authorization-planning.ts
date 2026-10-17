export type PlanningException = {
  start_date: string;
  end_date: string;
};

type Input = {
  startDate: string;
  endDate: string;
  weeklyDays: string[];
  startTime: string;
  endTime: string;
  breakMinutes: number;
  requiredHours: number;
  exceptions: PlanningException[];
};

const days = [
  "domingo", "segunda", "terca", "quarta",
  "quinta", "sexta", "sabado",
];

function normalizeDay(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .split("-")[0];
}

function minutes(value: string) {
  const parts = value.split(":").map(Number);
  if (
    parts.length < 2 ||
    !Number.isInteger(parts[0]) ||
    !Number.isInteger(parts[1]) ||
    parts[0] < 0 || parts[0] > 23 ||
    parts[1] < 0 || parts[1] > 59
  ) return NaN;

  return parts[0] * 60 + parts[1];
}

export function calculateAuthorizationPlan(input: Input) {
  const requiredMinutes = Math.round(input.requiredHours * 60);
  const dailyMinutes =
    minutes(input.endTime) -
    minutes(input.startTime) -
    input.breakMinutes;

  const selectedDays = new Set(
    input.weeklyDays.map(normalizeDay)
  );

  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(input.startDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.endDate) &&
    input.startDate <= input.endDate &&
    Number.isFinite(dailyMinutes) &&
    dailyMinutes > 0 &&
    Number.isFinite(requiredMinutes) &&
    requiredMinutes > 0 &&
    Number.isInteger(input.breakMinutes) &&
    input.breakMinutes >= 0 &&
    selectedDays.size > 0 &&
    [...selectedDays].every((day) => days.includes(day));

  if (!valid) {
    return {
      valid: false,
      sufficient: false,
      dailyMinutes: 0,
      availableMinutes: 0,
      requiredMinutes: Math.max(0, requiredMinutes || 0),
      scheduledDays: 0,
      exceptionDays: 0,
      expectedCompletion: null as string | null,
    };
  }

  let scheduledDays = 0;
  let exceptionDays = 0;
  let availableMinutes = 0;
  let expectedCompletion: string | null = null;

  const date = new Date(`${input.startDate}T12:00:00Z`);
  const end = new Date(`${input.endDate}T12:00:00Z`);

  // Evita intervalos excessivos ou datas inconsistentes.
  const rangeDays = Math.round(
    (end.getTime() - date.getTime()) / 86400000
  );

  if (!Number.isFinite(rangeDays) || rangeDays > 3660) {
    return {
      valid: false,
      sufficient: false,
      dailyMinutes: 0,
      availableMinutes: 0,
      requiredMinutes,
      scheduledDays: 0,
      exceptionDays: 0,
      expectedCompletion: null,
    };
  }

  for (
    let offset = 0;
    offset <= rangeDays;
    offset++, date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const current = date.toISOString().slice(0, 10);

    if (!selectedDays.has(days[date.getUTCDay()])) continue;

    const excepted = input.exceptions.some(
      (item) =>
        current >= item.start_date &&
        current <= item.end_date
    );

    if (excepted) {
      exceptionDays++;
      continue;
    }

    scheduledDays++;
    availableMinutes += dailyMinutes;

    if (
      expectedCompletion === null &&
      availableMinutes >= requiredMinutes
    ) {
      expectedCompletion = current;
    }
  }

  return {
    valid: true,
    sufficient: availableMinutes >= requiredMinutes,
    dailyMinutes,
    availableMinutes,
    requiredMinutes,
    scheduledDays,
    exceptionDays,
    expectedCompletion,
  };
}

export function formatPlanningMinutes(value: number) {
  return `${Math.floor(value / 60)}h${String(
    value % 60
  ).padStart(2, "0")}`;
}
