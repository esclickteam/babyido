import { differenceInDays, differenceInMonths, differenceInWeeks } from "date-fns";
import type { Locale } from "@/types";

export function getExactAge(birthDate: Date | string, locale: Locale): string {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const now = new Date();
  const months = differenceInMonths(now, birth);
  const weeks = differenceInWeeks(now, birth) % 4;
  const days = differenceInDays(now, birth) % 7;

  if (locale === "he") {
    if (months >= 1) {
      return `${months} חודשים${weeks > 0 ? ` ו-${weeks} שבועות` : ""}`;
    }
    if (weeks >= 1) {
      return `${weeks} שבועות${days > 0 ? ` ו-${days} ימים` : ""}`;
    }
    return `${differenceInDays(now, birth)} ימים`;
  }

  if (months >= 1) {
    return `${months} month${months > 1 ? "s" : ""}${weeks > 0 ? `, ${weeks} week${weeks > 1 ? "s" : ""}` : ""}`;
  }
  if (weeks >= 1) {
    return `${weeks} week${weeks > 1 ? "s" : ""}${days > 0 ? `, ${days} day${days > 1 ? "s" : ""}` : ""}`;
  }
  return `${differenceInDays(now, birth)} day${differenceInDays(now, birth) > 1 ? "s" : ""}`;
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
