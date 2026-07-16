import type { FoodCategory } from "@/constants/feeding";

export interface FoodItem {
  id: string;
  nameHe: string;
  nameEn: string;
  category: FoodCategory;
  fromMonth: number;
  isAllergen?: boolean;
  emoji: string;
  orderIndex?: number;
}

export interface TastingPhase {
  id: number;
  titleHe: string;
  subtitleHe: string;
  fromMonth: number;
  foods: FoodItem[];
}

function food(
  id: string,
  nameHe: string,
  nameEn: string,
  category: FoodCategory,
  fromMonth: number,
  emoji: string,
  isAllergen?: boolean
): FoodItem {
  return { id, nameHe, nameEn, category, fromMonth, emoji, isAllergen };
}

/** לפי משרד הבריאות — גיל מומלץ להתחלת הכרת מזנים */
export const MOH_RECOMMENDED_SOLIDS_MONTH = 6;

/** 9 שלבי הכרת מזון מומלצים */
export const TASTING_PHASES: TastingPhase[] = [
  {
    id: 1,
    titleHe: "טעימות ראשונות",
    subtitleHe: "5–10 ימים לכל מאכל · מאכל אחד בכל פעם · מומלץ מגיל 6 חודשים",
    fromMonth: 6,
    foods: [
      food("sweet-potato", "בטטה", "Sweet potato", "vegetables", 6, "🍠"),
      food("zucchini", "קישוא", "Zucchini", "vegetables", 6, "🥒"),
      food("carrot", "גזר", "Carrot", "vegetables", 6, "🥕"),
      food("pumpkin", "דלעת", "Pumpkin", "vegetables", 6, "🎃"),
      food("avocado", "אבוקדו", "Avocado", "fruits", 6, "🥑"),
    ],
  },
  {
    id: 2,
    titleHe: "פירות ראשונים",
    subtitleHe: "פירות מבושלים או רכים",
    fromMonth: 6,
    foods: [
      food("pear", "אגס", "Pear", "fruits", 6, "🍐"),
      food("apple-cooked", "תפוח מבושל", "Cooked apple", "fruits", 6, "🍎"),
      food("banana", "בננה", "Banana", "fruits", 6, "🍌"),
      food("peach", "אפרסק", "Peach", "fruits", 6, "🍑"),
      food("mango", "מנגו", "Mango", "fruits", 6, "🥭"),
    ],
  },
  {
    id: 3,
    titleHe: "ירקות נוספים",
    subtitleHe: "גיוון ירקות לפי סבלנות התינוק",
    fromMonth: 6,
    foods: [
      food("potato", "תפוח אדמה", "Potato", "vegetables", 6, "🥔"),
      food("broccoli", "ברוקולי", "Broccoli", "vegetables", 6, "🥦"),
      food("cauliflower", "כרובית", "Cauliflower", "vegetables", 6, "🥦"),
      food("peas", "אפונה", "Peas", "vegetables", 6, "🫛"),
      food("green-beans", "שעועית ירוקה", "Green beans", "vegetables", 6, "🫛"),
      food("beet", "סלק", "Beet", "vegetables", 6, "🫜"),
      food("corn", "תירס", "Corn", "vegetables", 7, "🌽"),
    ],
  },
  {
    id: 4,
    titleHe: "דגנים",
    subtitleHe: "לרוב מגיל 6–7 חודשים · אורז לא בהכרח ראשון",
    fromMonth: 6,
    foods: [
      food("oatmeal", "שיבולת שועל", "Oatmeal", "grains", 6, "🥣"),
      food("rice", "אורז", "Rice", "grains", 6, "🍚"),
      food("quinoa", "קינואה", "Quinoa", "grains", 7, "🌾"),
      food("buckwheat", "כוסמת", "Buckwheat", "grains", 7, "🌾"),
      food("couscous", "קוסקוס", "Couscous", "grains", 7, "🍚"),
      food("soft-pasta", "פסטה רכה", "Soft pasta", "grains", 8, "🍝"),
    ],
  },
  {
    id: 5,
    titleHe: "קטניות",
    subtitleHe: "מקור חלבון צמחי",
    fromMonth: 7,
    foods: [
      food("red-lentils", "עדשים אדומות", "Red lentils", "legumes", 7, "🫘"),
      food("chickpeas", "חומוס", "Chickpeas", "legumes", 7, "🫘"),
      food("white-beans", "שעועית לבנה", "White beans", "legumes", 7, "🫘"),
      food("green-lentils", "עדשים ירוקות", "Green lentils", "legumes", 7, "🫘"),
      food("dry-peas", "אפונה יבשה", "Dry peas", "legumes", 7, "🫛"),
    ],
  },
  {
    id: 6,
    titleHe: "חלבונים",
    subtitleHe: "עוף, דגים וביצה",
    fromMonth: 7,
    foods: [
      food("chicken", "עוף", "Chicken", "meats", 7, "🍗"),
      food("turkey", "הודו", "Turkey", "meats", 7, "🦃"),
      food("beef", "בקר", "Beef", "meats", 7, "🥩"),
      food("egg", "ביצה", "Egg", "allergens", 7, "🥚", true),
      food("salmon", "סלמון", "Salmon", "fish", 7, "🐟"),
      food("tilapia", "אמנון", "Tilapia", "fish", 8, "🐟"),
      food("cod", "בקלה", "Cod", "fish", 8, "🐟"),
    ],
  },
  {
    id: 7,
    titleHe: "מוצרי חלב",
    subtitleHe: "לא לפני גיל 8 חודשים ככלל",
    fromMonth: 8,
    foods: [
      food("yogurt-plain", "יוגורט טבעי", "Plain yogurt", "dairy", 8, "🥛"),
      food("white-cheese", "גבינה לבנה", "White cheese", "dairy", 8, "🧀"),
      food("cottage", "קוטג'", "Cottage cheese", "dairy", 8, "🧀"),
      food("ricotta", "ריקוטה", "Ricotta", "dairy", 8, "🧀"),
    ],
  },
  {
    id: 8,
    titleHe: "אלרגנים",
    subtitleHe: "במרקם בטוח ובהדרגה · בכל ספק פנו לרופא",
    fromMonth: 6,
    foods: [
      food("egg", "ביצה", "Egg", "allergens", 6, "🥚", true),
      food("tahini", "טחינה", "Tahini", "allergens", 7, "🫘", true),
      food("peanut-diluted", "חמאת בוטנים מדוללת", "Diluted peanut butter", "allergens", 7, "🥜", true),
      food("dairy-allergen", "מוצרי חלב", "Dairy products", "dairy", 8, "🥛"),
      food("fish-allergen", "דגים", "Fish", "fish", 7, "🐟"),
      food("wheat", "חיטה", "Wheat", "grains", 8, "🌾", true),
      food("soy", "סויה", "Soy", "allergens", 8, "🫘", true),
    ],
  },
  {
    id: 9,
    titleHe: "מעבר למרקמים",
    subtitleHe: "התקדמות במרקם — לא חובה לפי סדר קשיח",
    fromMonth: 8,
    foods: [
      food("texture-smooth", "מחית חלקה", "Smooth puree", "grains", 4, "🥄"),
      food("texture-thick", "מחית גסה", "Thick puree", "grains", 6, "🥣"),
      food("texture-soft", "חתיכות רכות", "Soft pieces", "grains", 8, "🍽️"),
      food("texture-finger", "מזון אצבע", "Finger food", "grains", 9, "👆"),
      food("texture-self", "אכילה עצמאית", "Self feeding", "grains", 10, "👶"),
    ],
  },
];

/** Flat ordered list for progress tracking (unique ids, first occurrence wins) */
export const ORDERED_FOODS: FoodItem[] = (() => {
  const seen = new Set<string>();
  const list: FoodItem[] = [];
  let index = 1;
  for (const phase of TASTING_PHASES) {
    for (const item of phase.foods) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      list.push({ ...item, orderIndex: index++ });
    }
  }
  return list;
})();

export const TASTING_ORDER = ORDERED_FOODS;

const CATALOG_IDS = new Set(ORDERED_FOODS.map((f) => f.id));

const EXTRA_FOODS: FoodItem[] = [
  food("apple", "תפוח", "Apple", "fruits", 5, "🍎"),
  food("apricot", "משמש", "Apricot", "fruits", 5, "🍑"),
  food("plum", "שזיף", "Plum", "fruits", 6, "🍑"),
  food("strawberry", "תות", "Strawberry", "fruits", 8, "🍓"),
  food("kiwi", "קיוי", "Kiwi", "fruits", 8, "🥝"),
  food("cucumber", "מלפפון", "Cucumber", "vegetables", 6, "🥒"),
  food("lentils", "עדשים", "Lentils", "legumes", 6, "🫘"),
  food("tuna", "טונה", "Tuna", "fish", 8, "🐟"),
  food("bread", "לחם / חלה", "Bread", "grains", 7, "🍞"),
  food("almond", "שקדים", "Almond", "allergens", 8, "🌰", true),
];

export const FOOD_CATALOG: FoodItem[] = [
  ...ORDERED_FOODS,
  ...EXTRA_FOODS.filter((f) => !CATALOG_IDS.has(f.id)),
];

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_CATALOG.find((f) => f.id === id) ?? TASTING_PHASES.flatMap((p) => p.foods).find((f) => f.id === id);
}

export function getPhaseForFood(foodId: string): TastingPhase | undefined {
  return TASTING_PHASES.find((phase) => phase.foods.some((f) => f.id === foodId));
}

export function isOrderedFood(food: FoodItem): boolean {
  return food.orderIndex != null;
}
