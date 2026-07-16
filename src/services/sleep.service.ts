import type { SleepEntry } from "@/types";
import type { FeedingPeriod } from "@/utils/date";

export interface SleepSummary {
  totalMinutes: number;
  napMinutes: number;
  nightMinutes: number;
  entries: SleepEntry[];
  activeEntry?: SleepEntry;
}

export interface SleepPeriodDay {
  date: string;
  total: number;
  napTotal: number;
  nightTotal: number;
}

export interface SleepPeriodSummary {
  period: FeedingPeriod;
  anchorDate: string;
  periodLabel: string;
  days: SleepPeriodDay[];
  grandTotal: number;
  napGrandTotal: number;
  nightGrandTotal: number;
  dailyAverage: number;
  dayCount: number;
}

export async function fetchSleepSummary(babyId: string, date?: string): Promise<SleepSummary> {
  const params = new URLSearchParams({ babyId });
  if (date) params.set("date", date);
  const res = await fetch(`/api/sleep/summary?${params}`);
  if (!res.ok) throw new Error("Failed to fetch sleep summary");
  return res.json();
}

export async function fetchSleepPeriodSummary(
  babyId: string,
  period: FeedingPeriod,
  date: string
): Promise<SleepPeriodSummary> {
  const params = new URLSearchParams({ babyId, period, date });
  const res = await fetch(`/api/sleep/period-summary?${params}`);
  if (!res.ok) throw new Error("Failed to fetch sleep period summary");
  return res.json();
}

export async function startSleep(data: Record<string, unknown>): Promise<SleepEntry> {
  const res = await fetch("/api/sleep-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to start sleep");
  }
  return res.json();
}

export async function patchSleep(id: string, data: Record<string, unknown>): Promise<SleepEntry> {
  const res = await fetch(`/api/sleep-entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to update sleep");
  }
  return res.json();
}

/** @deprecated use patchSleep */
export const endSleep = patchSleep;

export async function createSleepManual(data: Record<string, unknown>): Promise<SleepEntry> {
  const res = await fetch("/api/sleep-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to save sleep");
  }
  return res.json();
}

export async function deleteSleepEntry(id: string): Promise<void> {
  const res = await fetch(`/api/sleep-entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sleep entry");
}
