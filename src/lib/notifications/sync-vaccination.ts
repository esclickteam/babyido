import type { VaccineScheduleItem } from "@/constants/vaccinations";
import { Notification } from "@/models/Notification";
import type { IVaccinationRecord } from "@/models/VaccinationRecord";

export function vaccinationSourceKey(babyId: string, vaccineId: string) {
  return `vaccination:${babyId}:${vaccineId}`;
}

export async function syncVaccinationNotification({
  userId,
  babyId,
  babyName,
  vaccine,
  record,
}: {
  userId: string;
  babyId: string;
  babyName: string;
  vaccine: VaccineScheduleItem;
  record: IVaccinationRecord;
}) {
  const sourceKey = vaccinationSourceKey(babyId, vaccine.id);

  if (record.completed || !record.scheduledDate || !record.reminderEnabled) {
    await Notification.deleteOne({ userId, sourceKey });
    return;
  }

  const timeSuffix = record.scheduledTime ? ` בשעה ${record.scheduledTime}` : "";
  const title = `חיסון ${vaccine.nameHe} — ${babyName}`;
  const body = `תור ל${vaccine.nameHe} (${vaccine.doseHe})${timeSuffix}`;

  await Notification.findOneAndUpdate(
    { userId, sourceKey },
    {
      $set: {
        babyId,
        type: "vaccination",
        title,
        body,
        scheduledAt: record.scheduledDate,
        scheduledTime: record.scheduledTime,
        read: false,
        href: "/dashboard/journal",
      },
      $unset: { emailSentAt: 1 },
    },
    { upsert: true, new: true }
  );
}

export async function markVaccinationEmailSent(
  userId: string,
  babyId: string,
  vaccineId: string
) {
  const sourceKey = vaccinationSourceKey(babyId, vaccineId);
  await Notification.findOneAndUpdate(
    { userId, sourceKey },
    { $set: { emailSentAt: new Date() } }
  );
}
