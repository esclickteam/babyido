import type { FeedingType, FoodCategory, TastingReaction } from "@/constants/feeding";

export type Locale = "he";

export type Gender = "male" | "female" | "other";

export type BirthType = "vaginal" | "cesarean" | "other";

export type FeedingPreference = "breast" | "formula" | "mixed" | "solids";

export interface Baby {
  _id: string;
  userId: string;
  name: string;
  photoUrl?: string;
  birthDate: string;
  birthTime?: string;
  gender: Gender;
  gestationalWeek?: number;
  birthWeight?: number;
  birthHeight?: number;
  birthHeadCircumference?: number;
  birthType?: BirthType;
  hospital?: string;
  feedingType?: FeedingPreference;
  solidsStartedAt?: string;
  allergies?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrowthMeasurement {
  _id: string;
  babyId: string;
  date: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
  notes?: string;
  createdAt: string;
}

export interface FeedingEntry {
  _id: string;
  babyId: string;
  type: FeedingType;
  time: string;
  amount?: number;
  formulaBrand?: string;
  notes?: string;
  createdAt: string;
}

export interface SleepEntry {
  _id: string;
  babyId: string;
  startTime: string;
  endTime?: string;
  type: "night" | "nap";
  notes?: string;
  createdAt: string;
}

export interface Milestone {
  _id: string;
  babyId: string;
  milestoneId: string;
  date: string;
  photoUrl?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface TummyTimeEntry {
  _id: string;
  babyId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
}

export interface TastingEntry {
  _id: string;
  babyId: string;
  foodName: string;
  category: FoodCategory;
  photoUrl?: string;
  recommendedAge?: string;
  description?: string;
  nutritionalBenefits?: string;
  isAllergen?: boolean;
  tastedDate?: string;
  reactions: TastingReaction[];
  rating?: number;
  timesEaten?: number;
  notes?: string;
  isCustom?: boolean;
  foodId?: string;
  createdAt: string;
}

export interface VaccinationRecord {
  _id: string;
  babyId: string;
  vaccineId: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
  sideEffects?: string;
  reminderEnabled: boolean;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated use VaccinationRecord */
export interface Vaccination {
  _id: string;
  babyId: string;
  name: string;
  scheduledDate?: string;
  completedDate?: string;
  completed: boolean;
  notes?: string;
  reminderEnabled?: boolean;
}

export interface Reminder {
  _id: string;
  babyId: string;
  type: "vitaminD" | "iron" | "feeding" | "tasting" | "vaccination" | "measurement" | "doctor" | "medication" | "sleep" | "custom";
  title: string;
  scheduledAt: string;
  completed: boolean;
  notes?: string;
}

export interface DashboardStats {
  todayFeedingAmount: number;
  dailyFeedingGoal: number;
  todaySleepMinutes: number;
  lastWeight?: number;
  lastHeight?: number;
  lastHeadCircumference?: number;
  lastTasting?: TastingEntry;
  lastMilestone?: { milestoneId: string; titleHe: string; date: string };
  todayTummyTimeMinutes: number;
  nextVaccination?: { vaccineId: string; nameHe: string; scheduledDate?: string; recommendedDate: string };
  nextWellBabyVisit?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  notificationEmail?: string;
}

export type NotificationType =
  | "vaccination"
  | "feeding"
  | "tasting"
  | "appointment"
  | "reminder"
  | "custom"
  | "vitaminD"
  | "iron"
  | "measurement"
  | "doctor"
  | "medication"
  | "sleep";

export interface AppNotification {
  _id: string;
  userId: string;
  babyId?: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledAt: string;
  scheduledTime?: string;
  read: boolean;
  emailSentAt?: string;
  href?: string;
  createdAt: string;
}

export interface UserSettings {
  locale: Locale;
  theme: "light" | "dark" | "system";
  notificationEmail?: string;
}
