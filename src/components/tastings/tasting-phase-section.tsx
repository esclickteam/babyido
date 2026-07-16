"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { TastingPhase, FoodItem } from "@/constants/tastings";
import type { TastingEntry } from "@/types";
import { TastingFoodCard } from "@/components/tastings/tasting-food-card";
import {
  findNextRecommendedFoodId,
  getFoodStatus,
  getTastingsByFoodId,
} from "@/utils/tasting-status";
import { cn } from "@/lib/utils";

const PHASE_COLORS = [
  "from-[#fff6d6] to-[#e8f8ef]",
  "from-[#ffe8dc] to-[#fff0f5]",
  "from-[#e8f5e9] to-[#f1f8e9]",
  "from-[#fff3e0] to-[#fce4ec]",
  "from-[#e3f2fd] to-[#e8eaf6]",
  "from-[#f3e5f5] to-[#ede7f6]",
  "from-[#e0f7fa] to-[#e1f5fe]",
  "from-[#fff8e1] to-[#ffecb3]",
  "from-[#f9fbe7] to-[#f0f4c3]",
];

interface TastingPhaseSectionProps {
  phase: TastingPhase;
  hasStarted: boolean;
  tastings: TastingEntry[];
  defaultOpen?: boolean;
  getStatusLabel: (status: ReturnType<typeof getFoodStatus>) => string;
  fromMonthLabel: (month: number) => string;
  triedInPhaseLabel: (done: number, total: number) => string;
  onFoodClick: (food: FoodItem) => void;
}

export function TastingPhaseSection({
  phase,
  hasStarted,
  tastings,
  defaultOpen = false,
  getStatusLabel,
  fromMonthLabel,
  triedInPhaseLabel,
  onFoodClick,
}: TastingPhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const tastingsByFood = getTastingsByFoodId(tastings);
  const nextId = findNextRecommendedFoodId(tastingsByFood, hasStarted);

  const uniqueFoods = phase.foods.filter(
    (food, index, arr) => arr.findIndex((f) => f.id === food.id) === index
  );

  const triedCount = uniqueFoods.filter((f) => tastingsByFood.has(f.id)).length;
  const color = PHASE_COLORS[(phase.id - 1) % PHASE_COLORS.length];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-[var(--stroke)] bg-white/80 shadow-sm transition",
        !hasStarted && "opacity-90"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-4 bg-gradient-to-l px-5 py-4 text-right transition hover:brightness-[1.02]",
          color
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-lg font-bold text-[var(--grass-deep)] shadow-sm">
          {phase.id}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
            {phase.titleHe}
          </h3>
          <p className="text-sm text-muted-foreground">{phase.subtitleHe}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--ink)]/70">
            {triedInPhaseLabel(triedCount, uniqueFoods.length)} · {fromMonthLabel(phase.fromMonth)}
          </p>
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 text-[var(--grass-deep)] transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueFoods.map((food) => {
            const entry = tastingsByFood.get(food.id);
            const status = getFoodStatus(food.id, entry, nextId, hasStarted);
            const canLog = hasStarted && status !== "too_early" && status !== "not_started";

            return (
              <TastingFoodCard
                key={`${phase.id}-${food.id}`}
                food={food}
                status={status}
                statusLabel={getStatusLabel(status)}
                disabled={!canLog}
                onClick={() => canLog && onFoodClick(food)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
