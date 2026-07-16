"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVaccinationPlan, upsertVaccinationRecord } from "@/services/vaccination.service";

export function useVaccinationPlan(babyId: string | null) {
  return useQuery({
    queryKey: ["vaccinations", babyId],
    queryFn: () => fetchVaccinationPlan(babyId!),
    enabled: !!babyId,
  });
}

export function useUpsertVaccination(babyId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertVaccinationRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", babyId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", babyId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
