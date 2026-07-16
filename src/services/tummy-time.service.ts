import type { TummyTimeEntry } from "@/types";

export interface TummyTimeSummary {
  totalMinutes: number;
  entries: TummyTimeEntry[];
  activeEntry?: TummyTimeEntry;
}

export async function fetchTummyTimeSummary(
  babyId: string,
  date?: string
): Promise<TummyTimeSummary> {
  const params = new URLSearchParams({ babyId });
  if (date) params.set("date", date);
  const res = await fetch(`/api/tummy-time/summary?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tummy time summary");
  return res.json();
}

export async function startTummyTime(data: Record<string, unknown>): Promise<TummyTimeEntry> {
  const res = await fetch("/api/tummy-time-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Failed to start");
  }
  return res.json();
}

export async function endTummyTime(id: string, data: Record<string, unknown>): Promise<TummyTimeEntry> {
  const res = await fetch(`/api/tummy-time-entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to end session");
  return res.json();
}

export async function deleteTummyTimeEntry(id: string): Promise<void> {
  const res = await fetch(`/api/tummy-time-entries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}
