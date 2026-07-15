import { differenceInDays, differenceInMonths } from "date-fns";
import type { Locale } from "@/types";

/** Parse birth date as local calendar date (avoids UTC timezone shifts). */
export function parseBirthDate(birthDate: Date | string): Date {
  if (birthDate instanceof Date) return birthDate;

  const dateOnly = birthDate.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(birthDate);
}

/**
 * Calendar-month age: born on the 18th → turns a new month on each 18th.
 * e.g. 18.3 → 18.7 = 4 months.
 */
export function getBabyAgeInMonths(
  birthDate: Date | string,
  referenceDate: Date = new Date()
): number {
  return differenceInMonths(referenceDate, parseBirthDate(birthDate));
}

export function getExactAge(birthDate: Date | string, locale: Locale): string {
  const birth = parseBirthDate(birthDate);
  const now = new Date();
  const months = getBabyAgeInMonths(birth, now);

  if (locale === "he") {
    if (months >= 1) {
      if (months === 1) return "חודש אחד";
      if (months === 2) return "חודשיים";
      return `${months} חודשים`;
    }

    const totalDays = differenceInDays(now, birth);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    if (weeks >= 1) {
      const weekLabel = weeks === 1 ? "שבוע אחד" : weeks === 2 ? "שבועיים" : `${weeks} שבועות`;
      if (days === 0) return weekLabel;
      const dayLabel = days === 1 ? "יום אחד" : days === 2 ? "יומיים" : `${days} ימים`;
      return `${weekLabel} ו-${dayLabel}`;
    }

    if (totalDays <= 0) return "נולד/ה היום";
    if (totalDays === 1) return "יום אחד";
    if (totalDays === 2) return "יומיים";
    return `${totalDays} ימים`;
  }

  if (months >= 1) {
    return `${months} month${months > 1 ? "s" : ""}`;
  }

  const totalDays = differenceInDays(now, birth);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  if (weeks >= 1) {
    if (days === 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
    return `${weeks} week${weeks > 1 ? "s" : ""}, ${days} day${days > 1 ? "s" : ""}`;
  }

  if (totalDays <= 0) return "born today";
  return `${totalDays} day${totalDays > 1 ? "s" : ""}`;
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
