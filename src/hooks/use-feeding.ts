"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFeedingEntry,
  deleteFeedingEntry,
  fetchFeedingPeriodSummary,
  fetchFeedingSummary,
} from "@/services/feeding.service";
import type { FeedingPeriod } from "@/utils/date";

export function useFeedingSummary(babyId: string | null, date?: string, mealsPerDay = 8) {
  return useQuery({
    queryKey: ["feeding-summary", babyId, date, mealsPerDay],
    queryFn: () => fetchFeedingSummary(babyId!, date, mealsPerDay),
    enabled: !!babyId,
  });
}

export function useFeedingPeriodSummary(
  babyId: string | null,
  period: FeedingPeriod,
  date: string
) {
  return useQuery({
    queryKey: ["feeding-period-summary", babyId, period, date],
    queryFn: () => fetchFeedingPeriodSummary(babyId!, period, date),
    enabled: !!babyId && !!date,
  });
}

export function useCreateFeedingEntry(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFeedingEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeding-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["feeding-period-summary", babyId] });
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
      queryClient.invalidateQueries({ queryKey: ["feeding-period-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}
