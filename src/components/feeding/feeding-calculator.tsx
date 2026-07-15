"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFeedingSummary } from "@/hooks/use-feeding";
import { useBabyStore } from "@/stores/baby-store";
import { calculateDailyFormulaAmount } from "@/utils/date";
import { GlassCard } from "@/components/shared/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdoPanel } from "@/components/idoland/ido-panel";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

export function FeedingCalculator() {
  const t = useTranslations("feedingCalculator");
  const tc = useTranslations("common");
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const [meals, setMeals] = useState(8);

  const { data: summary } = useFeedingSummary(baby?._id ?? null, undefined, meals);

  if (!baby) return <NoBabyPrompt />;

  const weightKg = (summary?.lastWeightGrams ?? baby.birthWeight ?? 3500) / 1000;
  const { dailyTotal, perMeal } = calculateDailyFormulaAmount(weightKg, meals);
  const remaining = summary?.remaining ?? dailyTotal;

  return (
    <div className="space-y-6">
      <IdoPanel className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("weight")} ({tc("kg")})</Label>
          <p className={inputClass + " text-lg font-semibold"}>
            {weightKg.toFixed(2)} {tc("kg")}
          </p>
          <p className="text-xs text-muted-foreground">{t("fromLastWeighing")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="meals">{t("mealsPerDay")}</Label>
          <Input
            id="meals"
            type="number"
            min="1"
            max="12"
            className={inputClass}
            value={meals}
            onChange={(e) => setMeals(Number(e.target.value) || 8)}
          />
        </div>
      </IdoPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("dailyRecommended")} value={`${dailyTotal} ${tc("ml")}`} />
        <StatCard label={t("perMeal")} value={`${perMeal} ${tc("ml")}`} />
        <StatCard label={t("remainingToday")} value={`${remaining} ${tc("ml")}`} />
      </div>

      <GlassCard className="text-sm text-muted-foreground">
        {t("formulaNote")}
      </GlassCard>

      <LegalDisclaimer variant="feedingCalculator" />
    </div>
  );
}
