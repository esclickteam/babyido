"use client";

import { useBabyStore } from "@/stores/baby-store";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { TummyTimeTracker } from "@/components/tummy-time/tummy-time-tracker";

export function TummyTimeContent() {
  const baby = useBabyStore((s) => s.getSelectedBaby());
  if (!baby) return <NoBabyPrompt />;

  return (
    <div className="space-y-4">
      <LegalDisclaimer variant="general" />
      <TummyTimeTracker babyId={baby._id} variant="page" />
    </div>
  );
}
