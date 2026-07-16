import type { TastingReaction } from "@/constants/feeding";
import type { TastingEntry } from "@/types";
import { ORDERED_FOODS } from "@/constants/tastings";

export type FoodStatus =
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

export function getTastingsByFoodId(tastings: TastingEntry[]): Map<string, TastingEntry> {
  const map = new Map<string, TastingEntry>();
  for (const entry of tastings) {
    const key = entry.foodId ?? entry.foodName;
    if (!map.has(key)) map.set(key, entry);
  }
  return map;
}

export function findNextRecommendedFoodId(
  babyAgeMonths: number,
  tastingsByFood: Map<string, TastingEntry>
): string | null {
  for (const food of ORDERED_FOODS) {
    if (tastingsByFood.has(food.id)) continue;
    if (babyAgeMonths < food.fromMonth) continue;
    return food.id;
  }
  return null;
}

export function getFoodStatus(
  foodId: string,
  fromMonth: number,
  babyAgeMonths: number,
  entry: TastingEntry | undefined,
  nextRecommendedId: string | null
): FoodStatus {
  if (!entry) {
    if (babyAgeMonths < fromMonth) return "too_early";
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
