import { z } from "zod";

export const userSettingsSchema = z.object({
  notificationEmail: z
    .union([z.string().email("כתובת מייל לא תקינה"), z.literal("")])
    .optional()
    .nullable(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
