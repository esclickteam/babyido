"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTummyTimeEntry,
  endTummyTime,
  fetchTummyTimeSummary,
  startTummyTime,
} from "@/services/tummy-time.service";

export function useTummyTimeSummary(babyId: string | null, date?: string) {
  return useQuery({
    queryKey: ["tummy-time-summary", babyId, date],
    queryFn: () => fetchTummyTimeSummary(babyId!, date),
    enabled: !!babyId,
    refetchInterval: (query) => (query.state.data?.activeEntry ? 30_000 : false),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, babyId: string | null) {
  queryClient.invalidateQueries({ queryKey: ["tummy-time-summary", babyId] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
}

export function useStartTummyTime(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTummyTime,
    onSuccess: () => invalidate(queryClient, babyId),
  });
}

export function useEndTummyTime(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      endTummyTime(id, data),
    onSuccess: () => invalidate(queryClient, babyId),
  });
}

export function useDeleteTummyTimeEntry(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTummyTimeEntry,
    onSuccess: () => invalidate(queryClient, babyId),
  });
}
