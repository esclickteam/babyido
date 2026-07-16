import type { TastingReaction } from "@/constants/feeding";
import type { TastingEntry } from "@/types";
import { ORDERED_FOODS } from "@/constants/tastings";

/** Ministry of Health recommended age to start solids (months) */
export const MOH_RECOMMENDED_SOLIDS_MONTH = 6;

export type FoodStatus =
  | "not_started"
  | "too_early"
  | "recommended_now"
  | "tasted"
  | "loved"
  | "neutral"
  | "disliked"
  | "had_reaction"
  | "try_again";

const WARNING_REACTIONS: TastingReaction[] = [
  "allergy",
  "rash",
  "vomiting",
  "constipation",
  "diarrhea",
];

export function hasSolidsStarted(
  solidsStartedAt: string | undefined,
  tastingsCount: number
): boolean {
  return !!solidsStartedAt || tastingsCount > 0;
}

export function getTastingsByFoodId(tastings: TastingEntry[]): Map<string, TastingEntry> {
  const map = new Map<string, TastingEntry>();
  for (const entry of tastings) {
    const key = entry.foodId ?? entry.foodName;
    if (!map.has(key)) map.set(key, entry);
  }
  return map;
}

export function findNextRecommendedFoodId(
  tastingsByFood: Map<string, TastingEntry>,
  hasStarted: boolean
): string | null {
  if (!hasStarted) return null;

  for (const food of ORDERED_FOODS) {
    if (tastingsByFood.has(food.id)) continue;
    return food.id;
  }
  return null;
}

export function getFoodStatus(
  foodId: string,
  entry: TastingEntry | undefined,
  nextRecommendedId: string | null,
  hasStarted: boolean
): FoodStatus {
  if (!hasStarted) return "not_started";

  if (!entry) {
    if (foodId === nextRecommendedId) return "recommended_now";
    return "too_early";
  }

  const reactions = entry.reactions ?? [];

  if (reactions.some((r) => WARNING_REACTIONS.includes(r))) {
    return reactions.includes("disliked") ? "try_again" : "had_reaction";
  }
  if (reactions.includes("disliked")) return "try_again";
  if (reactions.includes("liked")) return "loved";
  if (reactions.length === 0) return "tasted";
  return "neutral";
}

export const FOOD_STATUS_META: Record<
  FoodStatus,
  { icon: string; colorClass: string; bgClass: string }
> = {
  not_started: {
    icon: "⏳",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted/30 border-[var(--stroke)]",
  },
  too_early: {
    icon: "⏳",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted/40 border-[var(--stroke)]",
  },
  recommended_now: {
    icon: "🍽️",
    colorClass: "text-[var(--coral)]",
    bgClass: "bg-[var(--coral)]/12 border-[var(--coral)] shadow-md",
  },
  tasted: {
    icon: "✅",
    colorClass: "text-[var(--grass-deep)]",
    bgClass: "bg-[var(--grass)]/12 border-[var(--grass)]/40",
  },
  loved: {
    icon: "❤️",
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50 border-rose-200",
  },
  neutral: {
    icon: "😐",
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50 border-amber-200",
  },
  disliked: {
    icon: "👎",
    colorClass: "text-orange-700",
    bgClass: "bg-orange-50 border-orange-200",
  },
  had_reaction: {
    icon: "⚠️",
    colorClass: "text-red-700",
    bgClass: "bg-red-50 border-red-200",
  },
  try_again: {
    icon: "🔁",
    colorClass: "text-violet-700",
    bgClass: "bg-violet-50 border-violet-200",
  },
};
