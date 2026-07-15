export const FEEDING_TYPES = [
  "breastfeeding",
  "bottle",
  "pumped",
  "formula",
  "solids",
] as const;

export type FeedingType = (typeof FEEDING_TYPES)[number];

export const FOOD_CATEGORIES = [
  "vegetables",
  "fruits",
  "grains",
  "legumes",
  "meats",
  "fish",
  "dairy",
  "allergens",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const TASTING_REACTIONS = [
  "liked",
  "disliked",
  "allergy",
  "constipation",
  "diarrhea",
  "rash",
  "vomiting",
  "other",
] as const;

export type TastingReaction = (typeof TASTING_REACTIONS)[number];
