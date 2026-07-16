/** לוח חיסוני שגרה לתינוקות — מבוסס על תוכנית משרד הבריאות וטיפת חלב (2025). */

export interface VaccineScheduleItem {
  id: string;
  visitAgeMonths: number;
  visitAgeWeeks?: number;
  visitLabelHe: string;
  nameHe: string;
  doseHe: string;
  emoji: string;
  /** הסבר מקורי — לא העתקה מילה במילה */
  descriptionHe: string;
  protectsHe: string;
  whereHe: string;
  seasonal?: boolean;
  seasonalNoteHe?: string;
  optional?: boolean;
  optionalNoteHe?: string;
}

export const MOH_VACCINE_SOURCE_URL =
  "https://me.health.gov.il/parenting/raising-children/immunization-schedule/babies-immunization-schedule/";

export const VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  // לידה
  {
    id: "hbv-1",
    visitAgeMonths: 0,
    visitLabelHe: "לידה",
    nameHe: "צהבת B",
    doseHe: "מנה 1",
    emoji: "💉",
    descriptionHe:
      "חיסון נגד דלקת כבד נגיפית מסוג B. ברוב המקרים תינוקות לא מראים תסמינים, אבל המחלה עלולה להיות קשה — החיסון מגן ביעילות גבוהה.",
    protectsHe: "דלקת כבד נגיפית B",
    whereHe: "בית חולים / טיפת חלב",
  },
  {
    id: "rsv-birth",
    visitAgeMonths: 0,
    visitLabelHe: "לידה",
    nameHe: "RSV",
    doseHe: "מנה 1",
    emoji: "🫁",
    descriptionHe:
      "חיסון נגד נגיף הנשימה RSV שגורם לדלקת ריאות ומחלות נשימתיות קשות בתינוקות. רוב התינוקות מקבלים אותו בבית החולים לאחר הלידה.",
    protectsHe: "מחלות נשימה מ-RSV",
    whereHe: "בית חולים",
    seasonal: true,
    seasonalNoteHe: "תינוקות שנולדו בין אוגוסט למרץ — בעיקר בעונת החורף",
  },

  // חודש
  {
    id: "hbv-2",
    visitAgeMonths: 1,
    visitLabelHe: "גיל חודש",
    nameHe: "צהבת B",
    doseHe: "מנה 2",
    emoji: "💉",
    descriptionHe: "המשך סדרת החיסון נגד דלקת כבד B — מנה שנייה במפגש גיל חודש בטיפת חלב.",
    protectsHe: "דלקת כבד נגיפית B",
    whereHe: "טיפת חלב",
  },
  {
    id: "rsv-1m",
    visitAgeMonths: 1,
    visitLabelHe: "גיל חודש",
    nameHe: "RSV",
    doseHe: "לפי צורך",
    emoji: "🫁",
    descriptionHe:
      "לתינוקות שלא קיבלו את החיסון בלידה — ניתן בטיפת חלב בעונת הפעילות של הנגיף.",
    protectsHe: "מחלות נשימה מ-RSV",
    whereHe: "טיפת חלב",
    seasonal: true,
    seasonalNoteHe: "אוגוסט עד מרץ",
  },

  // 6 שבועות (הוקדם מגיל חודשיים)
  {
    id: "pentavalent-1",
    visitAgeMonths: 0,
    visitAgeWeeks: 6,
    visitLabelHe: "גיל 6 שבועות",
    nameHe: "החיסון המחומש",
    doseHe: "מנה 1",
    emoji: "🛡️",
    descriptionHe:
      "חיסון משולב שמגן במנה אחת מפני מספר מחלות: דיפתריה, טטנוס, שעלת, פוליו והמופילוס אינפלואנזה. מנה ראשונה — הוקדם לגיל 6 שבועות לפי הנחיות משרד הבריאות.",
    protectsHe: "דיפתריה, טטנוס, שעלת, פוליו, Hib",
    whereHe: "טיפת חלב",
  },
  {
    id: "pcv-1",
    visitAgeMonths: 0,
    visitAgeWeeks: 6,
    visitLabelHe: "גיל 6 שבועות",
    nameHe: "פנאומוקוק",
    doseHe: "מנה 1",
    emoji: "🦠",
    descriptionHe:
      "חיסון נגד חיידק הפנאומוקוק שעלול לגרום לדלקת ריאות, דלקת אוזניים ודלקת קרום המוח.",
    protectsHe: "דלקת ריאות, דלקת קרום המוח, זיהומים נוספים",
    whereHe: "טיפת חלב",
  },
  {
    id: "rota-1",
    visitAgeMonths: 0,
    visitAgeWeeks: 6,
    visitLabelHe: "גיל 6 שבועות",
    nameHe: "רוטה",
    doseHe: "מנה 1 (פה)",
    emoji: "💧",
    descriptionHe: "חיסון שניתן בטיפות לפה נגד נגיף הרוטה שגורם לשלשול ולהקאות קשות בתינוקות.",
    protectsHe: "גסטרואנטריטיס ויראלית (רוטה)",
    whereHe: "טיפת חלב",
  },
  {
    id: "rsv-6w",
    visitAgeMonths: 0,
    visitAgeWeeks: 6,
    visitLabelHe: "גיל 6 שבועות",
    nameHe: "RSV",
    doseHe: "לפי צורך",
    emoji: "🫁",
    descriptionHe: "מנה נוספת לתינוקות שלא חוסנו קודם — בעונת הפעילות בלבד.",
    protectsHe: "מחלות נשימה מ-RSV",
    whereHe: "טיפת חלב",
    seasonal: true,
    seasonalNoteHe: "אוגוסט עד מרץ",
  },

  // 4 חודשים
  {
    id: "pentavalent-2",
    visitAgeMonths: 4,
    visitLabelHe: "גיל 4 חודשים",
    nameHe: "החיסון המחומש",
    doseHe: "מנה 2",
    emoji: "🛡️",
    descriptionHe: "מנה שנייה בחיסון המשולב — המשך בניית ההגנה.",
    protectsHe: "דיפתריה, טטנוס, שעלת, פוליו, Hib",
    whereHe: "טיפת חלב",
  },
  {
    id: "pcv-2",
    visitAgeMonths: 4,
    visitLabelHe: "גיל 4 חודשים",
    nameHe: "פנאומוקוק",
    doseHe: "מנה 2",
    emoji: "🦠",
    descriptionHe: "מנה שנייה — מחזקת את ההגנה מפני זיהומי פנאומוקוק.",
    protectsHe: "דלקת ריאות, דלקת קרום המוח",
    whereHe: "טיפת חלב",
  },
  {
    id: "rota-2",
    visitAgeMonths: 4,
    visitLabelHe: "גיל 4 חודשים",
    nameHe: "רוטה",
    doseHe: "מנה 2 (פה)",
    emoji: "💧",
    descriptionHe: "מנה שנייה בטיפות לפה — המשך סדרת החיסון נגד רוטה.",
    protectsHe: "גסטרואנטריטיס ויראלית",
    whereHe: "טיפת חלב",
  },

  // 6 חודשים
  {
    id: "pentavalent-3",
    visitAgeMonths: 6,
    visitLabelHe: "גיל 6 חודשים",
    nameHe: "החיסון המחומש",
    doseHe: "מנה 3",
    emoji: "🛡️",
    descriptionHe: "מנה שלישית — משלימה את סדרת הבסיס של החיסון המחומש בשנה הראשונה.",
    protectsHe: "דיפתריה, טטנוס, שעלת, פוליו, Hib",
    whereHe: "טיפת חלב",
  },
  {
    id: "rota-3",
    visitAgeMonths: 6,
    visitLabelHe: "גיל 6 חודשים",
    nameHe: "רוטה",
    doseHe: "מנה 3 (פה)",
    emoji: "💧",
    descriptionHe: "מנה שלישית ואחרונה בסדרת חיסון הרוטה.",
    protectsHe: "גסטרואנטריטיס ויראלית",
    whereHe: "טיפת חלב",
  },
  {
    id: "hbv-3",
    visitAgeMonths: 6,
    visitLabelHe: "גיל 6 חודשים",
    nameHe: "צהבת B",
    doseHe: "מנה 3",
    emoji: "💉",
    descriptionHe: "מנה שלישית ואחרונה בסדרת חיסון צהבת B לתינוקות.",
    protectsHe: "דלקת כבד נגיפית B",
    whereHe: "טיפת חלב",
  },
  {
    id: "measles-early",
    visitAgeMonths: 6,
    visitLabelHe: "גיל 6–11 חודשים",
    nameHe: "חצבת (מוקדם)",
    doseHe: "מנה מוקדמת",
    emoji: "⚠️",
    descriptionHe:
      "מנה מוקדמת נגד חצבת — מומלצת רק בזמן התפרצות פעילה, בנוסף לשתי המנות הרגילות.",
    protectsHe: "חצבת",
    whereHe: "טיפת חלב",
    optional: true,
    optionalNoteHe: "רק ביישובים עם התפרצות חצבת פעילה",
  },

  // 12 חודשים
  {
    id: "pentavalent-4",
    visitAgeMonths: 12,
    visitLabelHe: "גיל שנה",
    nameHe: "החיסון המחומש",
    doseHe: "מנה 4 (מחזקת)",
    emoji: "🛡️",
    descriptionHe: "מנה מחזקת רביעית — מחזקת את ההגנה לפני גיל שנה.",
    protectsHe: "דיפתריה, טטנוס, שעלת, פוליו, Hib",
    whereHe: "טיפת חלב",
  },
  {
    id: "pcv-3",
    visitAgeMonths: 12,
    visitLabelHe: "גיל שנה",
    nameHe: "פנאומוקוק",
    doseHe: "מנה 3 (מחזקת)",
    emoji: "🦠",
    descriptionHe: "מנה מחזקת שלישית — משלימה את סדרת החיסון נגד פנאומוקוק.",
    protectsHe: "דלקת ריאות, דלקת קרום המוח",
    whereHe: "טיפת חלב",
  },
  {
    id: "mmrv-1",
    visitAgeMonths: 12,
    visitLabelHe: "גיל שנה",
    nameHe: "החיסון המרובע (MMR-V)",
    doseHe: "מנה 1",
    emoji: "🔴",
    descriptionHe:
      "חיסון משולב נגד חצבת, חזרת, אדמת ואבעבועות רוח — מחלות ויראליות שעלולות להיות קשות אצל ילדים.",
    protectsHe: "חצבת, חזרת, אדמת, אבעבועות רוח",
    whereHe: "טיפת חלב",
  },

  // 18 חודשים
  {
    id: "hep-a-1",
    visitAgeMonths: 18,
    visitLabelHe: "גיל שנה וחצי",
    nameHe: "צהבת A",
    doseHe: "מנה 1",
    emoji: "💉",
    descriptionHe:
      "חיסון נגד דלקת כבד A — מחלת כבד שעלולה להתפשט דרך מזון ומים. מנה ראשונה בגיל שנה וחצי.",
    protectsHe: "דלקת כבד נגיפית A",
    whereHe: "טיפת חלב",
  },

  // 24 חודשים
  {
    id: "hep-a-2",
    visitAgeMonths: 24,
    visitLabelHe: "גיל שנתיים",
    nameHe: "צהבת A",
    doseHe: "מנה 2",
    emoji: "💉",
    descriptionHe: "מנה שנייה ואחרונה — משלימה את ההגנה מפני דלקת כבד A.",
    protectsHe: "דלקת כבד נגיפית A",
    whereHe: "טיפת חלב",
  },
];

export function getVaccineById(id: string): VaccineScheduleItem | undefined {
  return VACCINE_SCHEDULE.find((v) => v.id === id);
}

export const VACCINE_VISIT_GROUPS = (() => {
  const groups = new Map<string, VaccineScheduleItem[]>();
  for (const item of VACCINE_SCHEDULE) {
    const key = item.visitLabelHe;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()].map(([label, vaccines]) => ({ label, vaccines }));
})();
