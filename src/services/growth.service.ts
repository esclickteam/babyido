import type { GrowthMeasurement } from "@/types";

export async function fetchGrowthMeasurements(babyId: string): Promise<GrowthMeasurement[]> {
  const res = await fetch(`/api/growth-measurements?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch growth measurements");
  return res.json();
}

export async function createGrowthMeasurement(
  data: Record<string, unknown>
): Promise<GrowthMeasurement> {
  const res = await fetch("/api/growth-measurements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create growth measurement");
  return res.json();
}

export async function deleteGrowthMeasurement(id: string): Promise<void> {
  const res = await fetch(`/api/growth-measurements/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete growth measurement");
}
