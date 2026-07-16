import { addMonths, addWeeks } from "date-fns";
import type { VaccineScheduleItem } from "@/constants/vaccinations";
import { parseBirthDate } from "@/utils/age";
import { toDateOnlyString } from "@/utils/date";

export function getRecommendedVaccineDate(
  birthDate: string,
  vaccine: Pick<VaccineScheduleItem, "visitAgeMonths" | "visitAgeWeeks">
): string {
  const birth = parseBirthDate(birthDate);
  if (vaccine.visitAgeWeeks != null) {
    return toDateOnlyString(addWeeks(birth, vaccine.visitAgeWeeks));
  }
  return toDateOnlyString(addMonths(birth, vaccine.visitAgeMonths));
}

export function getReminderDate(scheduledDate: string): string {
  const [y, m, d] = scheduledDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return toDateOnlyString(date);
}

export function isReminderDueToday(scheduledDate: string, today: string): boolean {
  return getReminderDate(scheduledDate) === today;
}
