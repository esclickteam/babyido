import { Notification } from "@/models/Notification";
import type { IWellBabyVisit } from "@/models/WellBabyVisit";

export function wellBabySourceKey(babyId: string, visitId: string) {
  return `well-baby:${babyId}:${visitId}`;
}

export async function syncWellBabyNotification({
  userId,
  babyId,
  babyName,
  visit,
}: {
  userId: string;
  babyId: string;
  babyName: string;
  visit: IWellBabyVisit;
}) {
  const sourceKey = wellBabySourceKey(babyId, visit._id.toString());

  if (visit.completed || !visit.scheduledDate || !visit.reminderEnabled) {
    await Notification.deleteOne({ userId, sourceKey });
    return;
  }

  const timeSuffix = visit.scheduledTime ? ` בשעה ${visit.scheduledTime}` : "";
  const clinic = visit.clinicName ? ` · ${visit.clinicName}` : "";
  const title = `טיפת חלב — ${babyName}`;
  const body = `תור בטיפת חלב${timeSuffix}${clinic}`;

  await Notification.findOneAndUpdate(
    { userId, sourceKey },
    {
      $set: {
        babyId,
        type: "appointment",
        title,
        body,
        scheduledAt: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        read: false,
        href: "/dashboard/journal",
      },
      $unset: { emailSentAt: 1 },
    },
    { upsert: true, new: true }
  );
}
