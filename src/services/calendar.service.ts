import type { CalendarEvent, WellBabyVisit } from "@/types";

export async function fetchCalendarEvents(
  babyId: string,
  from: string,
  to: string
): Promise<CalendarEvent[]> {
  const res = await fetch(`/api/calendar?babyId=${babyId}&from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch calendar");
  const data = await res.json();
  return data.events;
}

export async function fetchWellBabyVisits(babyId: string): Promise<WellBabyVisit[]> {
  const res = await fetch(`/api/well-baby-visits?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch well-baby visits");
  return res.json();
}

export async function createWellBabyVisit(data: Record<string, unknown>): Promise<WellBabyVisit> {
  const res = await fetch("/api/well-baby-visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create visit");
  return res.json();
}

export async function updateWellBabyVisit(
  id: string,
  data: Record<string, unknown>
): Promise<WellBabyVisit> {
  const res = await fetch(`/api/well-baby-visits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update visit");
  return res.json();
}

export async function deleteWellBabyVisit(id: string): Promise<void> {
  const res = await fetch(`/api/well-baby-visits/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete visit");
}
