import { addMonths, format, isValid, parse } from "date-fns";
import fr from "date-fns/locale/fr";

export const toPeriod = (date: Date): string => format(date, "MM-yyyy");

export const toShortLabel = (date: Date): string => format(date, "MM/yy");

const capitalizeFirst = (s: string) =>
  s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export const periodToMonthLabel = (period: string): string => {
  const d = parse(period, "MM-yyyy", new Date());
  if (!isValid(d)) return period;
  return capitalizeFirst(format(d, "LLLL yyyy", { locale: fr }));
};

export const parseISODate = (iso: string): Date => {
  // iso expected YYYY-MM-DD (date-only)
  const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
};

export const buildMonthPeriodsDesc = (from: Date, to: Date): string[] => {
  // from/to are month anchor dates (1st of month)
  const periods: string[] = [];
  let cursor = new Date(to.getFullYear(), to.getMonth(), 1, 12, 0, 0);
  const stop = new Date(from.getFullYear(), from.getMonth(), 1, 12, 0, 0);

  while (cursor.getTime() >= stop.getTime()) {
    periods.push(toPeriod(cursor));
    cursor = addMonths(cursor, -1);
  }
  return periods;
};
