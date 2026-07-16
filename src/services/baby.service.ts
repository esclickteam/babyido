import type { Baby, DashboardStats } from "@/types";
import { getTodayLocal } from "@/utils/date";

export async function fetchBabies(): Promise<Baby[]> {
  const res = await fetch("/api/babies");
  if (!res.ok) throw new Error("Failed to fetch babies");
  return res.json();
}

export async function fetchBaby(id: string): Promise<Baby> {
  const res = await fetch(`/api/babies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch baby");
  return res.json();
}

export async function createBaby(data: Record<string, unknown>): Promise<Baby> {
  const res = await fetch("/api/babies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create baby");
  }
  return res.json();
}

export async function updateBaby(id: string, data: Record<string, unknown>): Promise<Baby> {
  const res = await fetch(`/api/babies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update baby");
  return res.json();
}

export async function deleteBaby(id: string): Promise<void> {
  const res = await fetch(`/api/babies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete baby");
}

export async function startSolids(babyId: string): Promise<Baby> {
  const res = await fetch(`/api/babies/${babyId}/start-solids`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start solids");
  return res.json();
}

export async function fetchDashboardStats(babyId: string): Promise<DashboardStats> {
  const params = new URLSearchParams({ babyId, date: getTodayLocal() });
  const res = await fetch(`/api/dashboard/stats?${params}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
