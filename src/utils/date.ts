import { format, formatDistanceToNow } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Locale } from "@/types";

export {
  calculateDailyFormulaAmount,
  getExactAge,
  minutesToHoursMinutes,
} from "@/utils/age";

const locales = { he, en: enUS };

export function getDateLocale(locale: Locale) {
  return locales[locale];
}

export function formatDate(date: Date | string, locale: Locale, pattern = "PPP") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: getDateLocale(locale) });
}

export function formatRelative(date: Date | string, locale: Locale) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale(locale) });
}
