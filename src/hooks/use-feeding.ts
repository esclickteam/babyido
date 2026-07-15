"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFeedingEntry,
  deleteFeedingEntry,
  fetchFeedingSummary,
} from "@/services/feeding.service";

export function useFeedingSummary(babyId: string | null, date?: string, mealsPerDay = 8) {
  return useQuery({
    queryKey: ["feeding-summary", babyId, date, mealsPerDay],
    queryFn: () => fetchFeedingSummary(babyId!, date, mealsPerDay),
    enabled: !!babyId,
  });
}

export function useCreateFeedingEntry(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedingEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeding-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}

export function useDeleteFeedingEntry(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedingEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeding-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}
