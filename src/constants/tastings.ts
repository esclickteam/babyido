import type { FoodCategory } from "@/constants/feeding";

export interface FoodItem {
  id: string;
  nameHe: string;
  nameEn: string;
  category: FoodCategory;
  fromMonth: number;
  isAllergen?: boolean;
  emoji: string;
  /** 1-based step in recommended first-tasting order */
  orderIndex?: number;
}

/** סדר טעימות ראשונות מומלץ — מאכל אחד בכל פעם */
export const TASTING_ORDER: FoodItem[] = [
  { id: "rice", nameHe: "אורז לתינוקות", nameEn: "Baby rice", category: "grains", fromMonth: 4, emoji: "🍚" },
  { id: "carrot", nameHe: "גזר", nameEn: "Carrot", category: "vegetables", fromMonth: 4, emoji: "🥕" },
  { id: "pumpkin", nameHe: "דלעת", nameEn: "Pumpkin", category: "vegetables", fromMonth: 4, emoji: "🎃" },
  { id: "sweet-potato", nameHe: "בטטה", nameEn: "Sweet potato", category: "vegetables", fromMonth: 4, emoji: "🍠" },
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

const ORDERED_IDS = new Set(TASTING_ORDER.map((f) => f.id));

/** מאכלים נוספים לחיפוש (מחוץ לסדר המומלץ) */
const EXTRA_FOODS: FoodItem[] = [
  { id: "potato", nameHe: "תפוח אדמה", nameEn: "Potato", category: "vegetables", fromMonth: 5, emoji: "🥔" },
  { id: "cauliflower", nameHe: "כרובית", nameEn: "Cauliflower", category: "vegetables", fromMonth: 6, emoji: "🥦" },
  { id: "broccoli", nameHe: "ברוקולי", nameEn: "Broccoli", category: "vegetables", fromMonth: 6, emoji: "🥦" },
  { id: "peas", nameHe: "אפונה", nameEn: "Peas", category: "vegetables", fromMonth: 6, emoji: "🫛" },
  { id: "green-beans", nameHe: "שעועית ירוקה", nameEn: "Green beans", category: "vegetables", fromMonth: 6, emoji: "🫛" },
  { id: "beet", nameHe: "סלק", nameEn: "Beet", category: "vegetables", fromMonth: 6, emoji: "🫜" },
  { id: "cucumber", nameHe: "מלפפון", nameEn: "Cucumber", category: "vegetables", fromMonth: 6, emoji: "🥒" },
  { id: "peach", nameHe: "אפרסק", nameEn: "Peach", category: "fruits", fromMonth: 5, emoji: "🍑" },
  { id: "apricot", nameHe: "משמש", nameEn: "Apricot", category: "fruits", fromMonth: 5, emoji: "🍑" },
  { id: "mango", nameHe: "מנגו", nameEn: "Mango", category: "fruits", fromMonth: 6, emoji: "🥭" },
  { id: "plum", nameHe: "שזיף", nameEn: "Plum", category: "fruits", fromMonth: 6, emoji: "🍑" },
  { id: "strawberry", nameHe: "תות", nameEn: "Strawberry", category: "fruits", fromMonth: 8, emoji: "🍓" },
  { id: "kiwi", nameHe: "קיוי", nameEn: "Kiwi", category: "fruits", fromMonth: 8, emoji: "🥝" },
  { id: "oatmeal", nameHe: "שיבולת שועל", nameEn: "Oatmeal", category: "grains", fromMonth: 6, emoji: "🥣" },
  { id: "pasta", nameHe: "פסטה", nameEn: "Pasta", category: "grains", fromMonth: 8, emoji: "🍝" },
  { id: "bread", nameHe: "לחם / חלה", nameEn: "Bread", category: "grains", fromMonth: 7, emoji: "🍞" },
  { id: "quinoa", nameHe: "קינואה", nameEn: "Quinoa", category: "grains", fromMonth: 8, emoji: "🌾" },
  { id: "turkey", nameHe: "הודו", nameEn: "Turkey", category: "meats", fromMonth: 7, emoji: "🦃" },
  { id: "tuna", nameHe: "טונה", nameEn: "Tuna", category: "fish", fromMonth: 8, emoji: "🐟" },
  { id: "cottage-cheese", nameHe: "גבינה לבנה", nameEn: "Cottage cheese", category: "dairy", fromMonth: 8, emoji: "🧀" },
  { id: "hard-cheese", nameHe: "גבינה צהובה", nameEn: "Hard cheese", category: "dairy", fromMonth: 8, emoji: "🧀" },
  { id: "tahini", nameHe: "טחינה", nameEn: "Tahini", category: "allergens", fromMonth: 7, isAllergen: true, emoji: "🫘" },
  { id: "sesame", nameHe: "שומשום", nameEn: "Sesame", category: "allergens", fromMonth: 7, isAllergen: true, emoji: "🫘" },
  { id: "soy", nameHe: "סויה", nameEn: "Soy", category: "allergens", fromMonth: 8, isAllergen: true, emoji: "🫘" },
  { id: "almond", nameHe: "שקדים", nameEn: "Almond", category: "allergens", fromMonth: 8, isAllergen: true, emoji: "🌰" },
  { id: "chickpeas", nameHe: "חומוס", nameEn: "Chickpeas", category: "legumes", fromMonth: 7, emoji: "🫘" },
  { id: "white-beans", nameHe: "שעועית לבנה", nameEn: "White beans", category: "legumes", fromMonth: 7, emoji: "🫘" },
];

export const ORDERED_FOODS: FoodItem[] = TASTING_ORDER.map((food, index) => ({
  ...food,
  orderIndex: index + 1,
}));

export const FOOD_CATALOG: FoodItem[] = [
  ...ORDERED_FOODS,
  ...EXTRA_FOODS.filter((f) => !ORDERED_IDS.has(f.id)),
];

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_CATALOG.find((f) => f.id === id);
}

export function isOrderedFood(food: FoodItem): boolean {
  return food.orderIndex != null;
}
