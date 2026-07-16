import { addMonths, differenceInDays, differenceInMonths } from "date-fns";
import type { Locale } from "@/types";

/** Parse any date value to local calendar day (no timezone shift). */
export function parseBirthDate(birthDate: Date | string): Date {
  if (birthDate instanceof Date) {
    return new Date(
      birthDate.getUTCFullYear(),
      birthDate.getUTCMonth(),
      birthDate.getUTCDate()
    );
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(birthDate)) {
    const dateOnly = birthDate.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const d = new Date(birthDate);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface BabyAgeParts {
  months: number;
  weeks: number;
  days: number;
}

/**
 * Calendar age: full months since birth day-of-month, then weeks + days
 * from the last monthiversary.
 * e.g. born 18.3, today 16.7 → 3 months + 4 weeks (from 18.6 to 16.7).
 */
export function getBabyAgeParts(
  birthDate: Date | string,
  referenceDate: Date = new Date()
): BabyAgeParts {
  const birth = parseBirthDate(birthDate);
  const months = differenceInMonths(referenceDate, birth);
  const monthAnchor = addMonths(birth, months);
  const remainingDays = Math.max(0, differenceInDays(referenceDate, monthAnchor));
  return {
    months,
    weeks: Math.floor(remainingDays / 7),
    days: remainingDays % 7,
  };
}

/**
 * Calendar-month count for eligibility checks (tastings etc.).
 * e.g. 18.3 → 18.7 = 4 months.
 */
export function getBabyAgeInMonths(
  birthDate: Date | string,
  referenceDate: Date = new Date()
): number {
  return getBabyAgeParts(birthDate, referenceDate).months;
}

function joinAgeParts(parts: string[], locale: Locale): string {
  if (parts.length === 0) return locale === "he" ? "נולד/ה היום" : "born today";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    return locale === "he" ? `${parts[0]} ו-${parts[1]}` : `${parts[0]} and ${parts[1]}`;
  }
  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(locale === "he" ? ", " : ", ");
  return locale === "he" ? `${rest} ו-${last}` : `${rest}, and ${last}`;
}

export function formatAgeParts({ months, weeks, days }: BabyAgeParts, locale: Locale): string {
  if (locale === "he") {
    const parts: string[] = [];

    if (months >= 1) {
      if (months === 1) parts.push("חודש אחד");
      else if (months === 2) parts.push("חודשיים");
      else parts.push(`${months} חודשים`);
    }

    if (weeks >= 1) {
      if (weeks === 1) parts.push("שבוע אחד");
      else if (weeks === 2) parts.push("שבועיים");
      else parts.push(`${weeks} שבועות`);
    }

    if (days >= 1) {
      if (days === 1) parts.push("יום אחד");
      else if (days === 2) parts.push("יומיים");
      else parts.push(`${days} ימים`);
    }

    if (parts.length === 0) {
      return months === 0 && weeks === 0 && days === 0 ? "נולד/ה היום" : "פחות מיום";
    }

    return joinAgeParts(parts, locale);
  }

  const parts: string[] = [];
  if (months >= 1) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (weeks >= 1) parts.push(`${weeks} week${weeks > 1 ? "s" : ""}`);
  if (days >= 1) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  return joinAgeParts(parts, locale);
}

export function getExactAge(birthDate: Date | string, locale: Locale): string {
  return formatAgeParts(getBabyAgeParts(birthDate), locale);
}

export function minutesToHoursMinutes(minutes: number, locale: Locale): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === "he") {
    if (hours === 0) return `${mins} דקות`;
    if (mins === 0) return `${hours} שעות`;
    return `${hours} שעות ו-${mins} דקות`;
  }

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateDailyFormulaAmount(
  weightKg: number,
  mealsPerDay: number
): { dailyTotal: number; perMeal: number } {
  const dailyTotal = Math.round(weightKg * 150);
  const perMeal = Math.round(dailyTotal / mealsPerDay);
  return { dailyTotal, perMeal };
}
