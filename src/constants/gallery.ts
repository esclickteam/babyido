/** Birth slot uses ageMonths = 0; months 1–12 follow. */
export const GALLERY_BIRTH_AGE_MONTHS = 0;

export const GALLERY_MAX_PHOTOS_PER_SLOT = 10;

export const GALLERY_MONTH_SLOTS = Array.from({ length: 12 }, (_, i) => i + 1);

export const GALLERY_AGE_SLOTS = [GALLERY_BIRTH_AGE_MONTHS, ...GALLERY_MONTH_SLOTS] as const;

export type GalleryAgeSlot = (typeof GALLERY_AGE_SLOTS)[number];
