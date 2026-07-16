"use client";

import type { FoodItem } from "@/constants/tastings";
import {
  FOOD_STATUS_META,
  type FoodStatus,
} from "@/utils/tasting-status";
import { cn } from "@/lib/utils";

interface TastingFoodCardProps {
  food: FoodItem;
  status: FoodStatus;
  statusLabel: string;
  phaseLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function TastingFoodCard({
  food,
  status,
  statusLabel,
  phaseLabel,
  disabled,
  onClick,
}: TastingFoodCardProps) {
  const meta = FOOD_STATUS_META[status];
  const isInteractive = !disabled && onClick && status !== "too_early";

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl leading-none sm:text-3xl">{food.emoji}</span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
            meta.bgClass,
            meta.colorClass
          )}
        >
          <span aria-hidden>{meta.icon}</span>
          <span>{statusLabel}</span>
        </span>
      </div>
      <div className="mt-3 space-y-1">
        <p className="font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[var(--ink)]">
          {food.nameHe}
        </p>
        {food.orderIndex != null && (
          <p className="text-xs text-muted-foreground">#{food.orderIndex} בסדר המומלץ</p>
        )}
        {phaseLabel && <p className="text-xs text-muted-foreground">{phaseLabel}</p>}
        {food.isAllergen && (
          <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            אלרגן
          </span>
        )}
      </div>
    </>
  );

  if (!isInteractive) {
    return (
      <div
        className={cn(
          "rounded-2xl border-2 p-4 transition",
          meta.bgClass,
          status === "too_early" && "opacity-70"
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border-2 p-4 text-right transition hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]",
        meta.bgClass,
        status === "recommended_now" && "ring-2 ring-[var(--coral)]/50"
      )}
    >
      {content}
    </button>
  );
}
