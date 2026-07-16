"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMilestonePlan, upsertMilestoneRecord } from "@/services/milestone.service";
import type { MilestoneCategory } from "@/constants/milestones";

export function useMilestonePlan(babyId: string | null, category?: MilestoneCategory) {
  return useQuery({
    queryKey: ["milestones", babyId, category],
    queryFn: () => fetchMilestonePlan(babyId!, category),
    enabled: !!babyId,
  });
}

export function useUpsertMilestone(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertMilestoneRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}
