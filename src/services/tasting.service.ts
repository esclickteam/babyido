import type { TastingEntry } from "@/types";

export async function fetchTastings(babyId: string): Promise<TastingEntry[]> {
  const res = await fetch(`/api/tastings?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch tastings");
  return res.json();
}

export async function createTasting(data: Record<string, unknown>): Promise<TastingEntry> {
  const res = await fetch("/api/tastings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tasting");
  return res.json();
}

export async function deleteTasting(id: string): Promise<void> {
  const res = await fetch(`/api/tastings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete tasting");
}
