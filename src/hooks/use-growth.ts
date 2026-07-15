"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGrowthMeasurement,
  deleteGrowthMeasurement,
  fetchGrowthMeasurements,
} from "@/services/growth.service";

export function useGrowthMeasurements(babyId: string | null) {
  return useQuery({
    queryKey: ["growth-measurements", babyId],
    queryFn: () => fetchGrowthMeasurements(babyId!),
    enabled: !!babyId,
  });
}

export function useCreateGrowthMeasurement(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGrowthMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth-measurements", babyId] });
      queryClient.invalidateQueries({ queryKey: ["feeding-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}

export function useDeleteGrowthMeasurement(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGrowthMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth-measurements", babyId] });
      queryClient.invalidateQueries({ queryKey: ["feeding-summary", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
    },
  });
}
