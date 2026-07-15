import { cookies } from "next/headers";
import type { Baby } from "@/types";

export const BABY_COOKIE = "babydo-baby";

export async function getSelectedBabyId(babies: Baby[]): Promise<string | null> {
  if (!babies.length) return null;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(BABY_COOKIE)?.value;
  if (fromCookie && babies.some((b) => b._id === fromCookie)) {
    return fromCookie;
  }

  return babies[0]._id;
}
