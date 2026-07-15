import { format, formatDistanceToNow } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Locale } from "@/types";

export {
  calculateDailyFormulaAmount,
  getBabyAgeInMonths,
  getExactAge,
  minutesToHoursMinutes,
  parseBirthDate,
} from "@/utils/age";

const locales = { he, en: enUS };

export function getDateLocale(locale: Locale) {
  return locales[locale];
}

export function formatDate(date: Date | string, locale: Locale, pattern = "PPP") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: getDateLocale(locale) });
}

/** Local calendar date, e.g. 16.07.2026 */
export function formatShortDate(date: Date | string, locale: Locale = "he") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d.M.yyyy", { locale: getDateLocale(locale) });
}

/** Date + time for meal logs, e.g. 16.07.2026 · 14:30 */
export function formatDateTime(date: Date | string, locale: Locale = "he") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d.M.yyyy · HH:mm", { locale: getDateLocale(locale) });
}

export function getTodayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getNowLocalTime(): string {
  return format(new Date(), "HH:mm");
}

/** Build local Date from yyyy-MM-dd + HH:mm */
export function combineLocalDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export function formatRelative(date: Date | string, locale: Locale) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale(locale) });
}
