import type { Locale } from "@/types";
import { GALLERY_BIRTH_AGE_MONTHS } from "@/constants/gallery";
import { formatShortDate } from "@/utils/date";

/** Label for gallery slot: birth date for slot 0, monthly age otherwise. */
export function formatGallerySlotLabel(
  ageMonths: number,
  locale: Locale,
  birthDate?: string
): string {
  if (ageMonths === GALLERY_BIRTH_AGE_MONTHS) {
    if (locale === "he") {
      return birthDate ? `נולדתי · ${formatShortDate(birthDate, locale)}` : "נולדתי";
    }
    return birthDate
      ? `Born · ${formatShortDate(birthDate, locale)}`
      : "Born";
  }

  return formatGalleryMonthLabel(ageMonths, locale);
}

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

export { GALLERY_AGE_SLOTS, GALLERY_MAX_PHOTOS_PER_SLOT } from "@/constants/gallery";
