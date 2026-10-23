// Dates du sitemap alignées sur le front (`src/modules/utils/date.ts` de
// code-du-travail-numerique) : une date sans heure saisie dans l'admin vaut
// minuit heure de Paris, émise avec le décalage du jour (`+01:00` / `+02:00`).

type CalendarDate = { year: number; month: number; day: number };

const PARIS_TIME_ZONE = "Europe/Paris";

const pad2 = (n: number): string => String(n).padStart(2, "0");

// Date saisie côté admin : « jour/mois/année », jour et mois sur 1 ou 2
// chiffres, année sur 2 ou 4 chiffres (`1/9/26`, lue en `20AA`), comme le
// formulaire des contenus éditoriaux. Une date ISO (`AAAA-MM-JJ`, éventuellement
// suivie d'une heure) est aussi acceptée. Undefined si la date n'existe pas.
const parseFrenchDate = (date: string): CalendarDate | undefined => {
  const value = date.trim();
  let year: number, month: number, day: number;
  const frMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (frMatch) {
    day = Number(frMatch[1]);
    month = Number(frMatch[2]);
    year = Number(frMatch[3]);
    if (frMatch[3].length === 2) year += 2000;
  } else if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    return undefined;
  }

  // Rejette les dates inexistantes (31/02, mois 13…) : Date.UTC les « déborde ».
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return undefined;
  }
  return { year, month, day };
};

// Date et heure murale de Paris à un instant donné, via Intl pour ne dépendre
// ni du fuseau du serveur ni d'une table d'heure d'été codée en dur.
const parisWallClock = (instant: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
};

// Décalage UTC de Paris (en minutes) à un instant donné.
const parisOffsetMinutesAt = (instant: Date): number => {
  const { year, month, day, hour, minute, second } = parisWallClock(instant);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return Math.round((wallClockAsUtc - instant.getTime()) / 60000);
};

// Instant de minuit heure de Paris le jour donné (le jour peut déborder, comme
// avec Date.UTC). Deux passes pour viser minuit Paris et non minuit UTC.
export const midnightInParis = ({ year, month, day }: CalendarDate): Date => {
  const midnightUtc = Date.UTC(year, month - 1, day);
  const firstGuess = parisOffsetMinutesAt(new Date(midnightUtc));
  const offset = parisOffsetMinutesAt(
    new Date(midnightUtc - firstGuess * 60000)
  );
  return new Date(midnightUtc - offset * 60000);
};

// Jour calendaire de Paris à un instant donné.
export const parisDate = (instant: Date): CalendarDate => {
  const { year, month, day } = parisWallClock(instant);
  return { year, month, day };
};

// Date saisie dans l'admin → minuit heure de Paris ; undefined si invalide.
export const transformStringDate = (date: string): Date | undefined => {
  const parsed = parseFrenchDate(date);
  return parsed && midnightInParis(parsed);
};

// Un instant pile à minuit heure de Paris (date sans heure) est émis comme sur
// le front : `2026-09-23T00:00:00+02:00`. Les autres gardent l'ISO UTC.
export function formatDateToCustomISO(date: Date): string {
  const { year, month, day, hour, minute, second } = parisWallClock(date);
  if (hour || minute || second || date.getUTCMilliseconds()) {
    return date.toISOString();
  }
  const offset = parisOffsetMinutesAt(date);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return `${year}-${pad2(month)}-${pad2(day)}T00:00:00${sign}${pad2(
    Math.floor(abs / 60)
  )}:${pad2(abs % 60)}`;
}
