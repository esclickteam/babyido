"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSleepManual,
  deleteSleepEntry,
  endSleep,
  fetchSleepPeriodSummary,
  fetchSleepSummary,
  startSleep,
} from "@/services/sleep.service";
import type { FeedingPeriod } from "@/utils/date";

export function useSleepSummary(babyId: string | null, date?: string) {
  return useQuery({
    queryKey: ["sleep-summary", babyId, date],
    queryFn: () => fetchSleepSummary(babyId!, date),
    enabled: !!babyId,
    refetchInterval: (query) => (query.state.data?.activeEntry ? 30_000 : false),
  });
}

export function useSleepPeriodSummary(
  babyId: string | null,
  period: FeedingPeriod,
  date: string
) {
  return useQuery({
    queryKey: ["sleep-period-summary", babyId, period, date],
    queryFn: () => fetchSleepPeriodSummary(babyId!, period, date),
    enabled: !!babyId && !!date,
  });
}

function invalidateSleep(queryClient: ReturnType<typeof useQueryClient>, babyId: string | null) {
  queryClient.invalidateQueries({ queryKey: ["sleep-summary", babyId] });
  queryClient.invalidateQueries({ queryKey: ["sleep-period-summary", babyId] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
}

export function useStartSleep(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startSleep,
    onSuccess: () => invalidateSleep(queryClient, babyId),
  });
}

export function useEndSleep(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => endSleep(id, data),
    onSuccess: () => invalidateSleep(queryClient, babyId),
  });
}

export function useCreateSleepManual(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSleepManual,
    onSuccess: () => invalidateSleep(queryClient, babyId),
  });
}

export function useDeleteSleepEntry(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSleepEntry,
    onSuccess: () => invalidateSleep(queryClient, babyId),
  });
}
