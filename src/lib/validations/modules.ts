import { z } from "zod";
import { FEEDING_TYPES } from "@/constants/feeding";
import { SLEEP_TYPES } from "@/constants/sleep";

export const feedingEntrySchema = z.object({
  babyId: z.string().min(1),
  type: z.enum(FEEDING_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  amount: z.number().min(0).optional(),
  formulaBrand: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type FeedingEntryInput = z.infer<typeof feedingEntrySchema>;

export const sleepStartSchema = z.object({
  babyId: z.string().min(1),
  type: z.enum(SLEEP_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const sleepEndSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
});

export const sleepPatchSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    time: z.string().min(1).optional(),
    type: z.enum(SLEEP_TYPES).optional(),
  })
  .refine((data) => !!data.type || (!!data.date && !!data.time), {
    message: "Provide type or end date/time",
  });

export const sleepManualSchema = z.object({
  babyId: z.string().min(1),
  type: z.enum(SLEEP_TYPES),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endTime: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export type SleepStartInput = z.infer<typeof sleepStartSchema>;
export type SleepEndInput = z.infer<typeof sleepEndSchema>;
export type SleepManualInput = z.infer<typeof sleepManualSchema>;

export const growthMeasurementSchema = z.object({
  babyId: z.string().min(1),
  date: z.string().min(1),
  weight: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  headCircumference: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type GrowthMeasurementInput = z.infer<typeof growthMeasurementSchema>;

export const tastingEntrySchema = z.object({
  babyId: z.string().min(1),
  foodName: z.string().min(1).max(100),
  category: z.enum([
    "vegetables",
    "fruits",
    "grains",
    "legumes",
    "meats",
    "fish",
    "dairy",
    "allergens",
  ]),
  tastedDate: z.string().min(1),
  reactions: z
    .array(
      z.enum([
        "liked",
        "disliked",
        "allergy",
        "constipation",
        "diarrhea",
        "rash",
        "vomiting",
        "other",
      ])
    )
    .default([]),
  isAllergen: z.boolean().optional(),
  recommendedAge: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  isCustom: z.boolean().optional(),
  foodId: z.string().optional(),
});

export type TastingEntryInput = z.infer<typeof tastingEntrySchema>;

export const vaccinationRecordSchema = z.object({
  babyId: z.string().min(1),
  vaccineId: z.string().min(1),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  completed: z.boolean().optional(),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional(),
  sideEffects: z.string().max(2000).optional(),
  reminderEnabled: z.boolean().optional(),
});

export type VaccinationRecordInput = z.infer<typeof vaccinationRecordSchema>;

export const numberField = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};
