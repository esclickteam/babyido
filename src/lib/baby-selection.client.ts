export const BABY_COOKIE = "babydo-baby";

export function setSelectedBabyCookie(id: string) {
  document.cookie = `${BABY_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
