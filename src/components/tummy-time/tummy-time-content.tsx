"use client";

import { useBabyStore } from "@/stores/baby-store";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { DashboardTummyTimeSection } from "@/components/dashboard/dashboard-tummy-time-section";

export function TummyTimeContent() {
  const baby = useBabyStore((s) => s.getSelectedBaby());
  if (!baby) return <NoBabyPrompt />;
  return <DashboardTummyTimeSection babyId={baby._id} />;
}
