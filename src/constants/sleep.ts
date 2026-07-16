export const SLEEP_TYPES = ["nap", "night"] as const;
export type SleepType = (typeof SLEEP_TYPES)[number];
