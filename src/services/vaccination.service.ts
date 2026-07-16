import type { VaccinationRecord } from "@/types";
import type { VaccineScheduleItem } from "@/constants/vaccinations";

export interface VaccineScheduleRow {
  vaccine: VaccineScheduleItem;
  recommendedDate: string;
  record: VaccinationRecord | null;
}

export interface VaccinationPlan {
  birthDate: string;
  schedule: VaccineScheduleRow[];
  completedCount: number;
  totalCount: number;
}

export async function fetchVaccinationPlan(babyId: string): Promise<VaccinationPlan> {
  const res = await fetch(`/api/vaccinations?babyId=${babyId}`);
  if (!res.ok) throw new Error("Failed to fetch vaccinations");
  return res.json();
}

export async function upsertVaccinationRecord(
  data: Record<string, unknown>
): Promise<VaccinationRecord> {
  const res = await fetch("/api/vaccinations", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save vaccination");
  return res.json();
}
