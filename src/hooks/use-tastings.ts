"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTasting, deleteTasting, fetchTastings } from "@/services/tasting.service";

export function useTastings(babyId: string | null) {
  return useQuery({
    queryKey: ["tastings", babyId],
    queryFn: () => fetchTastings(babyId!),
    enabled: !!babyId,
  });
}

export function useCreateTasting(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTasting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tastings", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useDeleteTasting(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTasting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tastings", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}
