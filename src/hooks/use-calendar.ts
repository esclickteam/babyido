"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWellBabyVisit,
  deleteWellBabyVisit,
  fetchCalendarEvents,
  fetchWellBabyVisits,
  updateWellBabyVisit,
} from "@/services/calendar.service";

export function useCalendarEvents(babyId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: ["calendar", babyId, from, to],
    queryFn: () => fetchCalendarEvents(babyId!, from, to),
    enabled: !!babyId && !!from && !!to,
  });
}

export function useWellBabyVisits(babyId: string | null) {
  return useQuery({
    queryKey: ["well-baby-visits", babyId],
    queryFn: () => fetchWellBabyVisits(babyId!),
    enabled: !!babyId,
  });
}

function invalidateCalendar(queryClient: ReturnType<typeof useQueryClient>, babyId: string | null) {
  queryClient.invalidateQueries({ queryKey: ["calendar", babyId] });
  queryClient.invalidateQueries({ queryKey: ["well-baby-visits", babyId] });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
}

export function useCreateWellBabyVisit(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWellBabyVisit,
    onSuccess: () => invalidateCalendar(queryClient, babyId),
  });
}

export function useUpdateWellBabyVisit(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateWellBabyVisit(id, data),
    onSuccess: () => invalidateCalendar(queryClient, babyId),
  });
}

export function useDeleteWellBabyVisit(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWellBabyVisit,
    onSuccess: () => invalidateCalendar(queryClient, babyId),
  });
}
