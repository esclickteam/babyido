import type { Locale } from "@/types";

/** Hebrew label for monthly gallery slot: "היום אני בן חודש" … "היום אני בן שנה". */
export function formatGalleryMonthLabel(ageMonths: number, locale: Locale): string {
  if (locale === "he") {
    if (ageMonths === 1) return "היום אני בן חודש";
    if (ageMonths === 2) return "היום אני בן חודשיים";
    if (ageMonths === 12) return "היום אני בן שנה";
    return `היום אני בן ${ageMonths} חודשים`;
  }

  if (ageMonths === 1) return "Today I'm 1 month old";
  if (ageMonths === 12) return "Today I'm 1 year old";
  return `Today I'm ${ageMonths} months old`;
}

export const GALLERY_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
