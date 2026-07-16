import { FOOD_CATALOG, type FoodItem } from "@/constants/tastings";

export function searchFoods(query: string, limit = 12): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_CATALOG.slice(0, limit);

  return FOOD_CATALOG.filter(
    (food) =>
      food.nameHe.includes(query.trim()) ||
      food.nameEn.toLowerCase().includes(q) ||
      food.id.includes(q)
  ).slice(0, limit);
}

export function normalizeFoodQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}
