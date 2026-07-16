import type { SleepEntry } from "@/types";
import { feedingEntryDateKey } from "@/utils/date";

export function sleepDurationMinutes(entry: Pick<SleepEntry, "startTime" | "endTime">): number {
  if (!entry.endTime) return 0;
  const start = new Date(entry.startTime).getTime();
  const end = new Date(entry.endTime).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

export function getElapsedMs(startTime: string, now = Date.now()): number {
  return Math.max(0, now - new Date(startTime).getTime());
}

/** Live timer display — always H:MM:SS */
export function formatElapsedTimerHms(startTime: string, now = Date.now()): string {
  const totalSeconds = Math.floor(getElapsedMs(startTime, now) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function parseElapsedHms(label: string): { hours: string; minutes: string; seconds: string } {
  const [hours = "0", minutes = "00", seconds = "00"] = label.split(":");
  return { hours, minutes, seconds };
}

/** Live timer display e.g. 05:32 or 1:05:32 */
export function formatElapsedTimer(startTime: string, now = Date.now()): string {
  const totalSeconds = Math.floor(getElapsedMs(startTime, now) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatTimeFromIso(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

export function sleepEntryEndDateKey(entry: Pick<SleepEntry, "startTime" | "endTime">): string | null {
  if (!entry.endTime) return null;
  return feedingEntryDateKey(entry.endTime);
}

export function isSleepActive(entry: Pick<SleepEntry, "endTime">): boolean {
  return !entry.endTime;
}
