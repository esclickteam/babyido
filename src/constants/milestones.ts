export type MilestoneCategory =
  | "development"
  | "teeth"
  | "nutrition"
  | "sleep"
  | "firstMoments";

export interface MilestoneScheduleItem {
  id: string;
  category: MilestoneCategory;
  groupLabelHe: string;
  titleHe: string;
  emoji: string;
  /** Typical age window in whole months */
  ageMonthsMin: number;
  ageMonthsMax: number;
}

function dev(group: string, id: string, title: string, emoji: string, min: number, max = min) {
  return { id, category: "development" as const, groupLabelHe: group, titleHe: title, emoji, ageMonthsMin: min, ageMonthsMax: max };
}

function item(
  category: MilestoneCategory,
  group: string,
  id: string,
  title: string,
  emoji: string,
  min: number,
  max = min
): MilestoneScheduleItem {
  return { id, category, groupLabelHe: group, titleHe: title, emoji, ageMonthsMin: min, ageMonthsMax: max };
}

export const MILESTONE_SCHEDULE: MilestoneScheduleItem[] = [
  // התפתחות
  dev("לידה – חודש", "dev-0-eye", "יוצר קשר עין קצר", "👀", 0, 1),
  dev("לידה – חודש", "dev-0-voice", "מגיב לקול", "👂", 0, 1),
  dev("לידה – חודש", "dev-0-blink", "ממצמץ לאור חזק", "✨", 0, 1),
  dev("לידה – חודש", "dev-0-move", "מזיז ידיים ורגליים באופן סימטרי", "🤲", 0, 1),
  dev("לידה – חודש", "dev-0-head", "מרים מעט את הראש בזמן שכיבה על הבטן", "👶", 0, 1),

  dev("2 חודשים", "dev-2-smile", "חיוך חברתי", "😊", 2),
  dev("2 חודשים", "dev-2-face", "עוקב אחרי פנים", "👀", 2),
  dev("2 חודשים", "dev-2-toy", "עוקב אחרי צעצוע", "🧸", 2),
  dev("2 חודשים", "dev-2-sound", "משמיע קולות ראשונים", "🗣️", 2),
  dev("2 חודשים", "dev-2-head", "מרים את הראש לכ-45°", "👶", 2),
  dev("2 חודשים", "dev-2-calm", "נרגע כשמדברים אליו", "💬", 2),

  dev("3 חודשים", "dev-3-smile", "מחייך הרבה", "😊", 3),
  dev("3 חודשים", "dev-3-laugh", "צוחק", "😄", 3),
  dev("3 חודשים", "dev-3-head", "מחזיק את הראש טוב יותר", "👶", 3),
  dev("3 חודשים", "dev-3-hands", "מביא ידיים לפה", "👐", 3),
  dev("3 חודשים", "dev-3-open", "פותח וסוגר כפות ידיים", "✋", 3),
  dev("3 חודשים", "dev-3-reach", "מתחיל להגיע לחפצים", "🎯", 3),

  dev("4 חודשים", "dev-4-roll", "מתהפך מהבטן לגב", "🔄", 4),
  dev("4 חודשים", "dev-4-grasp", "תופס צעצוע", "🧸", 4),
  dev("4 חודשים", "dev-4-mouth", "מכניס חפצים לפה", "👄", 4),
  dev("4 חודשים", "dev-4-name", "מגיב לשם", "📛", 4),
  dev("4 חודשים", "dev-4-play", "נהנה ממשחק", "🎮", 4),

  dev("5 חודשים", "dev-5-roll", "מתגלגל לשני הכיוונים", "🔄", 5),
  dev("5 חודשים", "dev-5-elbows", "נשען על האמות", "💪", 5),
  dev("5 חודשים", "dev-5-transfer", "מעביר חפץ מיד ליד", "🤲", 5),
  dev("5 חודשים", "dev-5-emotion", "מביע רגשות", "😊", 5),

  dev("6 חודשים", "dev-6-sit-help", "יושב עם תמיכה", "🪑", 6),
  dev("6 חודשים", "dev-6-sit", "מתחיל לשבת לבד", "🪑", 6),
  dev("6 חודשים", "dev-6-roll", "מתגלגל בקלות", "🔄", 6),
  dev("6 חודשים", "dev-6-name", "מגיב לשמו", "📛", 6),
  dev("6 חודשים", "dev-6-solids", "מתחיל טעימות", "🥄", 6),
  dev("6 חודשים", "dev-6-tooth", "מתחיל להוציא שיניים", "🦷", 6),
  dev("6 חודשים", "dev-6-babble", "מקשקש הברות (בה-בה, מה-מה)", "🗣️", 6),

  dev("7 חודשים", "dev-7-sit", "יושב ללא תמיכה", "🪑", 7),
  dev("7 חודשים", "dev-7-reach", "מושיט יד במדויק", "🎯", 7),
  dev("7 חודשים", "dev-7-transfer", "מעביר חפצים מיד ליד", "🤲", 7),
  dev("7 חודשים", "dev-7-recognize", "מזהה אנשים מוכרים", "👨‍👩‍👧", 7),
  dev("7 חודשים", "dev-7-peekaboo", "נהנה ממשחקי קוקו", "🙈", 7),

  dev("8 חודשים", "dev-8-crawl", "מתחיל לזחול", "🐛", 8),
  dev("8 חודשים", "dev-8-sit", "מתיישב לבד", "🪑", 8),
  dev("8 חודשים", "dev-8-clap", "מוחא כפיים", "👏", 8),
  dev("8 חודשים", "dev-8-no", "מגיב ל״לא״", "🙅", 8),

  dev("9 חודשים", "dev-9-crawl", "זוחל היטב", "🐛", 9),
  dev("9 חודשים", "dev-9-stand", "נעמד בעזרת רהיטים", "🧍", 9),
  dev("9 חודשים", "dev-9-pinch", "אוחז באחיזת פינצטה", "🤏", 9),
  dev("9 חודשים", "dev-9-object", "מחפש חפצים שנעלמו", "🔍", 9),
  dev("9 חודשים", "dev-9-wave", "מנופף לשלום", "👋", 9),

  dev("10 חודשים", "dev-10-stand", "עומד עם תמיכה", "🧍", 10),
  dev("10 חודשים", "dev-10-cruise", "הולך לאורך רהיטים", "🚶", 10),
  dev("10 חודשים", "dev-10-point", "מצביע על חפצים", "☝️", 10),
  dev("10 חודשים", "dev-10-understand", "מבין הוראות פשוטות", "💡", 10),

  dev("11 חודשים", "dev-11-stand", "עומד לבד לכמה שניות", "🧍", 11),
  dev("11 חודשים", "dev-11-mimic", "מחקה פעולות", "🪞", 11),
  dev("11 חודשים", "dev-11-cup", "שותה מכוס בעזרה", "🥤", 11),
  dev("11 חודשים", "dev-11-cause", "משחק במשחקי סיבה ותוצאה", "🎲", 11),

  dev("12 חודשים", "dev-12-walk", "הולך עם או בלי תמיכה", "🚶", 12),
  dev("12 חודשים", "dev-12-word", "אומר מילה ראשונה", "🗣️", 12),
  dev("12 חודשים", "dev-12-point", "מצביע כדי לבקש", "☝️", 12),
  dev("12 חודשים", "dev-12-clap", "מוחא כפיים", "👏", 12),
  dev("12 חודשים", "dev-12-give", "נותן חפץ למבוגר", "🎁", 12),
  dev("12 חודשים", "dev-12-finger", "אוכל מזון אצבע", "🥕", 12),

  dev("18 חודשים", "dev-18-walk", "הולך ורץ", "🏃", 18),
  dev("18 חודשים", "dev-18-climb", "מטפס", "🧗", 18),
  dev("18 חודשים", "dev-18-kick", "בועט בכדור", "⚽", 18),
  dev("18 חודשים", "dev-18-words", "אומר 10–20 מילים", "🗣️", 18),
  dev("18 חודשים", "dev-18-body", "מצביע על איברי גוף", "👃", 18),
  dev("18 חודשים", "dev-18-pretend", "משחק משחקי דמיון פשוטים", "🎭", 18),
  dev("18 חודשים", "dev-18-spoon", "משתמש בכפית", "🥄", 18),

  dev("24 חודשים", "dev-24-run", "רץ היטב", "🏃", 24),
  dev("24 חודשים", "dev-24-jump", "קופץ", "🦘", 24),
  dev("24 חודשים", "dev-24-stairs", "עולה מדרגות", "🪜", 24),
  dev("24 חודשים", "dev-24-two-words", "מחבר שתי מילים", "🗣️", 24),
  dev("24 חודשים", "dev-24-vocab", "אוצר מילים של עשרות מילים", "📚", 24),
  dev("24 חודשים", "dev-24-sort", "ממיין צבעים וצורות פשוטות", "🎨", 24),
  dev("24 חודשים", "dev-24-play", "משחק עם ילדים", "👫", 24),

  dev("36 חודשים", "dev-36-sentences", "מדבר במשפטים", "💬", 36),
  dev("36 חודשים", "dev-36-hop", "קופץ על רגל אחת", "🦶", 36),
  dev("36 חודשים", "dev-36-circle", "מצייר עיגול", "⭕", 36),
  dev("36 חודשים", "dev-36-bike", "רוכב על תלת אופן", "🚲", 36),
  dev("36 חודשים", "dev-36-dress", "מתלבש חלקית לבד", "👕", 36),
  dev("36 חודשים", "dev-36-imagine", "משחק משחקי דמיון מורכבים", "🎭", 36),

  // שיניים
  item("teeth", "שיניים", "teeth-1", "שן ראשונה", "🦷", 6, 10),
  item("teeth", "שיניים", "teeth-2", "שתי שיניים", "🦷", 7, 12),
  item("teeth", "שיניים", "teeth-4", "ארבע שיניים", "🦷", 9, 14),
  item("teeth", "שיניים", "teeth-8", "שמונה שיניים", "🦷", 12, 18),
  item("teeth", "שיניים", "teeth-year", "שנה עם מספר שיניים", "😁", 12, 24),
  item("teeth", "שיניים", "teeth-all", "כל שיני החלב", "😁", 24, 36),

  // תזונה
  item("nutrition", "תזונה", "food-first", "טעימה ראשונה", "🥄", 6, 7),
  item("nutrition", "תזונה", "food-fruit", "פרי ראשון", "🍎", 6, 8),
  item("nutrition", "תזונה", "food-veg", "ירק ראשון", "🥕", 6, 8),
  item("nutrition", "תזונה", "food-water", "שתיית מים", "💧", 6, 9),
  item("nutrition", "תזונה", "food-solid1", "ארוחת מוצקים ראשונה", "🍽️", 7, 9),
  item("nutrition", "תזונה", "food-solid2", "שתי ארוחות מוצקים", "🍽️", 8, 10),
  item("nutrition", "תזונה", "food-solid3", "שלוש ארוחות מוצקים", "🍽️", 9, 12),
  item("nutrition", "תזונה", "food-finger", "אוכל אצבע", "🥕", 8, 12),
  item("nutrition", "תזונה", "food-hands", "אוכל לבד עם הידיים", "🖐️", 10, 14),
  item("nutrition", "תזונה", "food-spoon", "אוכל עם כפית", "🥄", 12, 18),
  item("nutrition", "תזונה", "food-cup", "שותה מכוס", "🥤", 10, 14),
  item("nutrition", "תזונה", "food-bottle", "מסיים בקבוק לבד", "🍼", 12, 18),

  // שינה
  item("sleep", "שינה", "sleep-night", "ישן לילה שלם", "🌙", 4, 12),
  item("sleep", "שינה", "sleep-room", "עובר לחדר משלו", "🛏️", 6, 24),
  item("sleep", "שינה", "sleep-nap3", "מוריד תנומה שלישית", "😴", 6, 10),
  item("sleep", "שינה", "sleep-nap2", "מוריד תנומה שנייה", "😴", 12, 18),
  item("sleep", "שינה", "sleep-nap1", "מוריד תנומת בוקר", "☀️", 15, 24),

  // רגעים ראשונים
  item("firstMoments", "רגעים ראשונים", "first-smile", "חיוך ראשון", "😊", 1, 3),
  item("firstMoments", "רגעים ראשונים", "first-laugh", "צחוק ראשון", "😄", 3, 5),
  item("firstMoments", "רגעים ראשונים", "first-roll", "גלגול ראשון", "🔄", 4, 6),
  item("firstMoments", "רגעים ראשונים", "first-crawl", "זחילה ראשונה", "🐛", 7, 10),
  item("firstMoments", "רגעים ראשונים", "first-sit", "ישיבה ראשונה", "🪑", 5, 8),
  item("firstMoments", "רגעים ראשונים", "first-stand", "עמידה ראשונה", "🧍", 9, 12),
  item("firstMoments", "רגעים ראשונים", "first-step", "צעד ראשון", "👣", 10, 14),
  item("firstMoments", "רגעים ראשונים", "first-word", "מילה ראשונה", "🗣️", 10, 14),
  item("firstMoments", "רגעים ראשונים", "first-clap", "מחיאת כפיים ראשונה", "👏", 7, 10),
  item("firstMoments", "רגעים ראשונים", "first-kiss", "נשיקה ראשונה", "💋", 6, 12),
  item("firstMoments", "רגעים ראשונים", "first-draw", "ציור ראשון", "🎨", 12, 24),
  item("firstMoments", "רגעים ראשונים", "first-daycare", "יום ראשון בגן", "🏫", 12, 36),
  item("firstMoments", "רגעים ראשונים", "first-birthday", "יום הולדת ראשון", "🎂", 12, 12),
  item("firstMoments", "רגעים ראשונים", "first-haircut", "תספורת ראשונה", "✂️", 6, 18),
  item("firstMoments", "רגעים ראשונים", "first-sea", "ביקור ראשון בים", "🌊", 3, 24),
  item("firstMoments", "רגעים ראשונים", "first-pool", "ביקור ראשון בבריכה", "🏊", 6, 24),
  item("firstMoments", "רגעים ראשונים", "first-flight", "טיסה ראשונה", "✈️", 3, 36),
  item("firstMoments", "רגעים ראשונים", "first-vacation", "חופשה ראשונה", "🏖️", 3, 36),
];

export const MILESTONE_CATEGORIES: { id: MilestoneCategory; labelKey: string; emoji: string }[] = [
  { id: "development", labelKey: "catDevelopment", emoji: "👶" },
  { id: "teeth", labelKey: "catTeeth", emoji: "🦷" },
  { id: "nutrition", labelKey: "catNutrition", emoji: "🍽️" },
  { id: "sleep", labelKey: "catSleep", emoji: "😴" },
  { id: "firstMoments", labelKey: "catFirstMoments", emoji: "❤️" },
];

export function getMilestoneById(id: string) {
  return MILESTONE_SCHEDULE.find((m) => m.id === id);
}

export function getMilestoneGroups(category: MilestoneCategory) {
  const items = MILESTONE_SCHEDULE.filter((m) => m.category === category);
  const groups = new Map<string, MilestoneScheduleItem[]>();
  for (const m of items) {
    const list = groups.get(m.groupLabelHe) ?? [];
    list.push(m);
    groups.set(m.groupLabelHe, list);
  }
  return [...groups.entries()].map(([label, milestones]) => ({ label, milestones }));
}

/** @deprecated legacy enum — use milestoneId */
export const MILESTONE_TYPES = ["other"] as const;
export type MilestoneType = (typeof MILESTONE_TYPES)[number];
