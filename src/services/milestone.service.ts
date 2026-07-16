import type { MilestoneScheduleItem } from "@/constants/milestones";
import type { Milestone } from "@/types";
import type { MilestoneStatus } from "@/utils/milestone-status";

export interface MilestonePlanRow {
  milestone: MilestoneScheduleItem;
  record: Milestone | null;
  status: MilestoneStatus;
}

export interface MilestonePlan {
  birthDate: string;
  schedule: MilestonePlanRow[];
  completedCount: number;
  totalCount: number;
  expectedSoonCount: number;
  nextExpected: MilestonePlanRow | null;
}

export async function fetchMilestonePlan(
  babyId: string,
  category?: string
): Promise<MilestonePlan> {
  const params = new URLSearchParams({ babyId });
  if (category) params.set("category", category);
  const res = await fetch(`/api/milestones?${params}`);
  if (!res.ok) throw new Error("Failed to fetch milestones");
  return res.json();
}

export async function upsertMilestoneRecord(
  data: Record<string, unknown>
): Promise<Milestone | { deleted: boolean }> {
  const res = await fetch("/api/milestones", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save milestone");
  return res.json();
}
