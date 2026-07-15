import { z } from "zod";

export const babySchema = z.object({
  name: z.string().min(1).max(100),
  photoUrl: z.string().optional(),
  birthDate: z.string().min(1),
  birthTime: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  gestationalWeek: z.number().min(20).max(45).optional(),
  birthWeight: z.number().min(0).optional(),
  birthHeight: z.number().min(0).optional(),
  birthHeadCircumference: z.number().min(0).optional(),
  birthType: z.enum(["vaginal", "cesarean", "other"]).optional(),
  hospital: z.string().max(200).optional(),
  feedingType: z.enum(["breast", "formula", "mixed", "solids"]).optional(),
  allergies: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});

export type BabyFormValues = z.infer<typeof babySchema>;

export const numberField = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};
