import {
  addDays,
  addWeeks,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
} from "date-fns";
import fr from "date-fns/locale/fr";
import { startOfWeek } from "date-fns";

export type GeneratedWeek = {
  id: string;
  label: string;
  start: Date;
  end: Date;
  startISO: string;
  endISO: string;
};

export const parseWhatIsNewPeriod = (period: string): Date | null => {
  // Expected format: MM-YYYY
  const parsed = parse(period, "MM-yyyy", new Date());
  if (!isValid(parsed)) return null;

  // Use midday to avoid timezone/DST edge cases when formatting dates.
  return new Date(parsed.getFullYear(), parsed.getMonth(), 1, 12, 0, 0);
};

export const toISODate = (date: Date): string => format(date, "yyyy-MM-dd");

export const formatWeekLabel = (start: Date, end: Date): string => {
  const startMonth = format(start, "LLLL", { locale: fr });
  const endMonth = format(end, "LLLL", { locale: fr });

  const startDay = format(start, "d", { locale: fr });
  const endDay = format(end, "d", { locale: fr });

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `Semaine du ${startDay} au ${endDay} ${startMonth}`;
  }
  return `Du ${startDay} ${startMonth} au ${endDay} ${endMonth}`;
};

export const generateWeeksForPeriod = (period: string): GeneratedWeek[] => {
  const monthStart = parseWhatIsNewPeriod(period);
  if (!monthStart) return [];

  const monthEnd = endOfMonth(monthStart);

  // First Monday within the month (ISO-like weeks).
  let start = startOfWeek(monthStart, { weekStartsOn: 1 });
  if (isBefore(start, monthStart)) {
    start = addWeeks(start, 1);
  }

  const weeks: GeneratedWeek[] = [];
  while (!isAfter(start, monthEnd)) {
    const end = addDays(start, 6);
    const startISO = toISODate(start);
    const endISO = toISODate(end);

    weeks.push({
      id: `${startISO}_${endISO}`,
      label: formatWeekLabel(start, end),
      start,
      end,
      startISO,
      endISO,
    });

    start = addWeeks(start, 1);
  }

  return weeks;
};
