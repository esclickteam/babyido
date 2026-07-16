import { getBabyAgeInMonths } from "@/utils/age";
import type { MilestoneScheduleItem } from "@/constants/milestones";
import type { Milestone } from "@/types";

export type MilestoneStatus =
  | "completed"
  | "expected_soon"
  | "approaching"
  | "upcoming"
  | "available";

export const MILESTONE_STATUS_META: Record<
  MilestoneStatus,
  { icon: string; colorClass: string; bgClass: string }
> = {
  completed: { icon: "⭐", colorClass: "text-emerald-800", bgClass: "bg-emerald-50 border-emerald-200" },
  expected_soon: { icon: "⏳", colorClass: "text-sky-800", bgClass: "bg-sky-50 border-sky-200" },
  approaching: { icon: "👀", colorClass: "text-violet-800", bgClass: "bg-violet-50 border-violet-200" },
  upcoming: { icon: "📅", colorClass: "text-slate-600", bgClass: "bg-slate-50 border-slate-200" },
  available: { icon: "✨", colorClass: "text-amber-800", bgClass: "bg-amber-50 border-amber-200" },
};

export function getMilestoneStatus(
  birthDate: string,
  item: MilestoneScheduleItem,
  record?: Milestone | null
): MilestoneStatus {
  if (record) return "completed";
  const age = getBabyAgeInMonths(birthDate);
  if (age >= item.ageMonthsMin && age <= item.ageMonthsMax) return "expected_soon";
  if (age < item.ageMonthsMin && age >= item.ageMonthsMin - 1) return "approaching";
  if (age > item.ageMonthsMax) return "available";
  return "upcoming";
}

export function formatAgeRangeHe(min: number, max: number): string {
  if (min === max) {
    if (min === 0) return "לידה – חודש";
    if (min === 12) return "שנה";
    if (min === 18) return "שנה וחצי";
    if (min === 24) return "שנתיים";
    if (min === 36) return "שלוש שנים";
    return `${min} חודשים`;
  }
  if (min === 0) return "לידה – חודש";
  return `${min}–${max} חודשים`;
}
