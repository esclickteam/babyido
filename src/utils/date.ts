import { format, formatDistanceToNow, isValid } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Locale } from "@/types";
import { parseBirthDate } from "@/utils/age";

export {
  calculateDailyFormulaAmount,
  getBabyAgeInMonths,
  getBabyAgeParts,
  getExactAge,
  minutesToHoursMinutes,
  parseBirthDate,
} from "@/utils/age";

const locales = { he, en: enUS };

/** Hebrew display pattern: 18/03/2026 */
export const HE_DATE_PATTERN = "d/MM/yyyy";

export function getDateLocale(locale: Locale) {
  return locales[locale];
}

function toLocalDate(date: Date | string): Date {
  return parseBirthDate(date);
}

/** yyyy-MM-dd for API / storage */
export function toDateOnlyString(date: Date | string): string {
  const d = parseBirthDate(date);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Store date-only in MongoDB at noon UTC (no off-by-one day) */
export function dateOnlyToMongo(dateStr: string): Date {
  const normalized = dateStr.split("T")[0];
  const [y, m, d] = normalized.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** yyyy-MM-dd → 18/03/2026 */
export function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const d = parseBirthDate(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getDate()}/${mm}/${d.getFullYear()}`;
}

/** 18/03/2026 → yyyy-MM-dd */
export function displayToIso(display: string): string | null {
  const cleaned = display.trim().replace(/[.\-]/g, "/");
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;

  const date = new Date(year, month - 1, day);
  if (
    !isValid(date) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return format(date, "yyyy-MM-dd");
}

export function formatDate(
  date: Date | string,
  locale: Locale = "he",
  pattern?: string
) {
  const d = toLocalDate(date);
  const p = pattern ?? (locale === "he" ? HE_DATE_PATTERN : "PPP");
  return format(d, p, { locale: getDateLocale(locale) });
}

export function formatShortDate(date: Date | string, locale: Locale = "he") {
  return formatDate(date, locale, HE_DATE_PATTERN);
}

/** 18/03/2026 · 14:30 */
export function formatDateTime(date: Date | string, locale: Locale = "he") {
  const d = toLocalDate(date);
  const datePart = format(d, HE_DATE_PATTERN, { locale: getDateLocale(locale) });
  const timePart = format(d, "HH:mm");
  return `${datePart} · ${timePart}`;
}

export function getTodayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getNowLocalTime(): string {
  return format(new Date(), "HH:mm");
}

/** yyyy-MM-dd in Asia/Jerusalem (for server-side feeding day boundaries) */
export function getTodayIsrael(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(
    new Date()
  );
}

/** Parse HH:mm or h:mm AM/PM */
export function parseTimeInput(timeStr: string): { hours: number; minutes: number } | null {
  const trimmed = timeStr.trim().toUpperCase();
  const m24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hours = Number(m24[1]);
    const minutes = Number(m24[2]);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }
  const m12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (m12) {
    let hours = Number(m12[1]) % 12;
    if (m12[3] === "PM") hours += 12;
    const minutes = Number(m12[2]);
    if (minutes >= 0 && minutes < 60) return { hours, minutes };
  }
  return null;
}

/** Store feeding datetime as wall-clock UTC (date + time the user entered) */
export function feedingDateTimeToMongo(dateStr: string, timeStr: string): Date {
  const normalized = dateStr.split("T")[0];
  const [y, m, d] = normalized.split("-").map(Number);
  const parsed = parseTimeInput(timeStr);
  if (!parsed) throw new Error("Invalid time");
  return new Date(Date.UTC(y, m - 1, d, parsed.hours, parsed.minutes, 0));
}

/** Day range for feeding queries (wall-clock UTC boundaries) */
export function getFeedingDayRange(dateStr: string): { start: Date; end: Date } {
  const normalized = dateStr.split("T")[0];
  const [y, m, d] = normalized.split("-").map(Number);
  return {
    start: new Date(Date.UTC(y, m - 1, d, 0, 0, 0)),
    end: new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)),
  };
}

/** Format feeding time stored as wall-clock UTC */
export function formatFeedingDateTime(date: Date | string, locale: Locale = "he"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const datePart = format(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
    HE_DATE_PATTERN,
    { locale: getDateLocale(locale) }
  );
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${datePart} · ${hh}:${min}`;
}

/** Build local Date from yyyy-MM-dd + HH:mm */
export function combineLocalDateTime(dateStr: string, timeStr: string): Date {
  const parsed = parseTimeInput(timeStr);
  if (!parsed) throw new Error("Invalid time");
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, parsed.hours, parsed.minutes, 0);
}

export function formatRelative(date: Date | string, locale: Locale) {
  const d = toLocalDate(date);
  return formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale(locale) });
}
