import type { FeedingEntry } from "@/types";

export interface FeedingSummary {
  todayTotal: number;
  dailyGoal: number;
  perMeal: number;
  remaining: number;
  lastWeightGrams: number;
  mealsPerDay: number;
  entries: FeedingEntry[];
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
  if (!res.ok) throw new Error("Failed to create feeding entry");
  return res.json();
}

export async function deleteFeedingEntry(id: string): Promise<void> {
  const res = await fetch(`/api/feeding-entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feeding entry");
}
