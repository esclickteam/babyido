"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { calculateDailyFormulaAmount } from "@/utils/date";
import { GlassCard } from "@/components/shared/glass-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FeedingCalculator() {
  const t = useTranslations("feedingCalculator");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [weight, setWeight] = useState(3.5);
  const [meals, setMeals] = useState(8);

  const { dailyTotal, perMeal } = calculateDailyFormulaAmount(weight, meals);

  return (
    <div className="space-y-6">
      <GlassCard className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">{t("weight")} ({tc("kg")})</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="1"
            max="20"
            className="rounded-xl"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meals">{t("mealsPerDay")}</Label>
          <Input
            id="meals"
            type="number"
            min="1"
            max="12"
            className="rounded-xl"
            value={meals}
            onChange={(e) => setMeals(Number(e.target.value))}
          />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("dailyRecommended")} value={`${dailyTotal} ${tc("ml")}`} />
        <StatCard label={t("perMeal")} value={`${perMeal} ${tc("ml")}`} />
        <StatCard label={t("remainingToday")} value={`${dailyTotal} ${tc("ml")}`} />
      </div>

      <LegalDisclaimer variant="feedingCalculator" />
    </div>
  );
}
