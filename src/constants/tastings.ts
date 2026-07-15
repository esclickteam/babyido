import type { FoodCategory } from "@/constants/feeding";

export interface RecommendedFood {
  id: string;
  nameHe: string;
  nameEn: string;
  category: FoodCategory;
  fromMonth: number;
  isAllergen?: boolean;
  emoji: string;
}

/** סדר טעימות מומלץ לתינוקות (הדרכת הורים / טיפת חלב) */
export const TASTING_ORDER: RecommendedFood[] = [
  { id: "rice", nameHe: "אורז לתינוקות", nameEn: "Baby rice", category: "grains", fromMonth: 4, emoji: "🍚" },
  { id: "carrot", nameHe: "גזר", nameEn: "Carrot", category: "vegetables", fromMonth: 4, emoji: "🥕" },
  { id: "pumpkin", nameHe: "דלעת", nameEn: "Pumpkin", category: "vegetables", fromMonth: 4, emoji: "🎃" },
  { id: "zucchini", nameHe: "קישוא", nameEn: "Zucchini", category: "vegetables", fromMonth: 5, emoji: "🥒" },
  { id: "apple", nameHe: "תפוח", nameEn: "Apple", category: "fruits", fromMonth: 5, emoji: "🍎" },
  { id: "pear", nameHe: "אגס", nameEn: "Pear", category: "fruits", fromMonth: 5, emoji: "🍐" },
  { id: "banana", nameHe: "בננה", nameEn: "Banana", category: "fruits", fromMonth: 5, emoji: "🍌" },
  { id: "chicken", nameHe: "עוף", nameEn: "Chicken", category: "meats", fromMonth: 6, emoji: "🍗" },
  { id: "egg", nameHe: "ביצה", nameEn: "Egg", category: "allergens", fromMonth: 6, isAllergen: true, emoji: "🥚" },
  { id: "yogurt", nameHe: "יוגורט", nameEn: "Yogurt", category: "dairy", fromMonth: 6, emoji: "🥛" },
  { id: "lentils", nameHe: "עדשים", nameEn: "Lentils", category: "legumes", fromMonth: 6, emoji: "🫘" },
  { id: "avocado", nameHe: "אבוקדו", nameEn: "Avocado", category: "fruits", fromMonth: 6, emoji: "🥑" },
  { id: "salmon", nameHe: "סלמון", nameEn: "Salmon", category: "fish", fromMonth: 7, emoji: "🐟" },
  { id: "peanut", nameHe: "חמאת בוטנים", nameEn: "Peanut butter", category: "allergens", fromMonth: 7, isAllergen: true, emoji: "🥜" },
  { id: "beef", nameHe: "בקר", nameEn: "Beef", category: "meats", fromMonth: 7, emoji: "🥩" },
];
