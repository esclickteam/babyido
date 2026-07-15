import type { FeedingEntry } from "@/types";
import type { FeedingPeriod } from "@/utils/date";

export interface FeedingSummary {
  todayTotal: number;
  dailyGoal: number;
  perMeal: number;
  remaining: number;
  lastWeightGrams: number;
  mealsPerDay: number;
  entries: FeedingEntry[];
}

export interface FeedingPeriodDay {
  date: string;
  total: number;
}

export interface FeedingPeriodSummary {
  period: FeedingPeriod;
  anchorDate: string;
  periodLabel: string;
  days: FeedingPeriodDay[];
  grandTotal: number;
  dailyAverage: number;
  dayCount: number;
}

export async function fetchFeedingPeriodSummary(
  babyId: string,
  period: FeedingPeriod,
  date: string
): Promise<FeedingPeriodSummary> {
  const params = new URLSearchParams({ babyId, period, date });
  const res = await fetch(`/api/feeding/period-summary?${params}`);
  if (!res.ok) throw new Error("Failed to fetch feeding period summary");
  return res.json();
}

export async function fetchFeedingSummary(
  babyId: string,
  date?: string,
  mealsPerDay = 8
): Promise<FeedingSummary> {
  const params = new URLSearchParams({ babyId, mealsPerDay: String(mealsPerDay) });
  if (date) params.set("date", date);
  const res = await fetch(`/api/feeding/summary?${params}`);
  if (!res.ok) throw new Error("Failed to fetch feeding summary");
  return res.json();
}

export async function createFeedingEntry(data: Record<string, unknown>): Promise<FeedingEntry> {
  const res = await fetch("/api/feeding-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to create feeding entry");
  }
  return res.json();
}

export async function deleteFeedingEntry(id: string): Promise<void> {
  const res = await fetch(`/api/feeding-entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feeding entry");
}
