"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBaby,
  deleteBaby,
  fetchBabies,
  fetchDashboardStats,
  startSolids,
  updateBaby,
} from "@/services/baby.service";
import { useBabyStore } from "@/stores/baby-store";
import type { DashboardStats } from "@/types";
import { useEffect } from "react";

export function useBabies() {
  const setBabies = useBabyStore((s) => s.setBabies);

  const query = useQuery({
    queryKey: ["babies"],
    queryFn: fetchBabies,
  });

  useEffect(() => {
    if (query.data) setBabies(query.data);
  }, [query.data, setBabies]);

  return query;
}

export function useCreateBaby() {
  const queryClient = useQueryClient();
  const addBaby = useBabyStore((s) => s.addBaby);

  return useMutation({
    mutationFn: createBaby,
    onSuccess: (baby) => {
      addBaby(baby);
      useBabyStore.getState().selectBaby(baby._id);
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useUpdateBaby() {
  const queryClient = useQueryClient();
  const update = useBabyStore((s) => s.updateBaby);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateBaby(id, data),
    onSuccess: (baby) => {
      update(baby);
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useStartSolids() {
  const queryClient = useQueryClient();
  const update = useBabyStore((s) => s.updateBaby);

  return useMutation({
    mutationFn: startSolids,
    onSuccess: (baby) => {
      update(baby);
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useDeleteBaby() {
  const queryClient = useQueryClient();
  const removeBaby = useBabyStore((s) => s.removeBaby);

  return useMutation({
    mutationFn: deleteBaby,
    onSuccess: (_, id) => {
      removeBaby(id);
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useDashboardStats(babyId: string | null, initialData?: DashboardStats) {
  return useQuery({
    queryKey: ["dashboard-stats", babyId],
    queryFn: () => fetchDashboardStats(babyId!),
    enabled: !!babyId,
    initialData: initialData && babyId ? initialData : undefined,
  });
}
