export type CalendarException = {
  start_date: string;
  end_date: string;
};

type ProjectionInput = {
  startDate: string;
  endDate: string;
  weeklyDays: string[];
  dailyMinutes: number;
  completedMinutes: number;
  requiredMinutes: number;
  exceptions: CalendarException[];
  today: string;
};

function parseDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`);
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDay(date: Date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function normalizeDay(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .split("-")[0];
}

const dayNames = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

export function calculateInternshipProjection(input: ProjectionInput) {
  const remainingMinutes = Math.max(
    0,
    input.requiredMinutes - input.completedMinutes
  );

  const authorizedDays = new Set(
    input.weeklyDays.map(normalizeDay)
  );

  const firstAvailable = [
    input.startDate,
    input.today,
  ].sort().at(-1) as string;

  const isException = (date: string) =>
    input.exceptions.some(
      (item) =>
        date >= item.start_date &&
        date <= item.end_date
    );

  const isScheduled = (date: Date) => {
    const dateText = isoDate(date);

    return (
      authorizedDays.has(dayNames[date.getUTCDay()]) &&
      !isException(dateText)
    );
  };

  let availableMinutes = 0;
  let availableDays = 0;
  let excludedDays = 0;

  if (
    input.dailyMinutes > 0 &&
    firstAvailable <= input.endDate
  ) {
    for (
      let date = parseDate(firstAvailable);
      isoDate(date) <= input.endDate;
      date = addDay(date)
    ) {
      const dateText = isoDate(date);
      const isRegularDay = authorizedDays.has(
        dayNames[date.getUTCDay()]
      );

      if (isRegularDay && isException(dateText)) {
        excludedDays++;
      }

      if (isScheduled(date)) {
        availableDays++;
        availableMinutes += input.dailyMinutes;
      }
    }
  }

  let projectedDate: string | null =
    remainingMinutes === 0 ? input.today : null;

  let needsExtension = false;

  if (remainingMinutes > 0 && input.dailyMinutes > 0) {
    let projectedMinutes = 0;
    let date = parseDate(firstAvailable);

    // Limite de segurança para não percorrer datas indefinidamente.
    for (let index = 0; index < 730; index++) {
      const dateText = isoDate(date);

      if (isScheduled(date)) {
        projectedMinutes += input.dailyMinutes;
      }

      if (projectedMinutes >= remainingMinutes) {
        projectedDate = dateText;
        break;
      }

      date = addDay(date);
    }

    needsExtension =
      availableMinutes < remainingMinutes ||
      (projectedDate !== null &&
        projectedDate > input.endDate);
  }

  return {
    remainingMinutes,
    availableMinutes,
    availableDays,
    excludedDays,
    projectedDate,
    needsExtension,
    insufficientSchedule:
      input.dailyMinutes <= 0 ||
      authorizedDays.size === 0,
  };
}
