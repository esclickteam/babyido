import type { SleepEntry } from "@/types";
import { feedingEntryDateKey } from "@/utils/date";

export function sleepDurationMinutes(entry: Pick<SleepEntry, "startTime" | "endTime">): number {
  if (!entry.endTime) return 0;
  const start = new Date(entry.startTime).getTime();
  const end = new Date(entry.endTime).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

export function sleepEntryEndDateKey(entry: Pick<SleepEntry, "startTime" | "endTime">): string | null {
  if (!entry.endTime) return null;
  return feedingEntryDateKey(entry.endTime);
}

export function isSleepActive(entry: Pick<SleepEntry, "endTime">): boolean {
  return !entry.endTime;
}
