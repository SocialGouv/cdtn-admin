import { formatDistanceToNow, parseISO } from "date-fns";
import frLocale from "date-fns/locale/fr";

export function toMs(minutes = 0) {
  return toSecond(minutes) * 1000;
}

export function toSecond(minutes = 0) {
  return minutes * 60;
}

export function getExpiryDate(minutes = 0) {
  return new Date(Date.now() + toMs(minutes));
}

export const timeSince = (date: string) =>
  formatDistanceToNow(parseISO(date), { locale: frLocale });
