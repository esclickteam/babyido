export const MILESTONE_TYPES = [
  "smile",
  "laugh",
  "eyeContact",
  "headLift",
  "tummyToBack",
  "backToTummy",
  "sitting",
  "crawling",
  "standing",
  "walking",
  "clapping",
  "rolling",
  "firstWord",
  "firstTooth",
  "other",
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];
