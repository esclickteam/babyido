import { addDays } from "date-fns";
import { expandJournalOccurrences } from "@/lib/journal/expand-events";
import { Notification } from "@/models/Notification";
import type { IJournalEvent } from "@/models/JournalEvent";
import { combineLocalDateTime, getTodayLocal, toDateOnlyString } from "@/utils/date";

const REMINDER_LABELS: Record<number, string> = {
  15: "15 דקות לפני",
  30: "30 דקות לפני",
  60: "שעה לפני",
  120: "שעתיים לפני",
  1440: "יום לפני",
  2880: "יומיים לפני",
};

function reminderLabel(minutes: number) {
  return REMINDER_LABELS[minutes] ?? `${minutes} דקות לפני`;
}

export function journalEventSourcePrefix(eventId: string) {
  return `journal:${eventId}:`;
}

export async function syncJournalEventNotifications(
  userId: string,
  event: IJournalEvent
) {
  const eventId = event._id.toString();
  const prefix = journalEventSourcePrefix(eventId);

  await Notification.deleteMany({
    userId,
    sourceKey: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });

  if (!event.remindersEnabled) return;

  const from = getTodayLocal();
  const to = toDateOnlyString(addDays(new Date(), 90));
  const startDate = toDateOnlyString(event.startDate);

  const occurrences = expandJournalOccurrences(
    {
      startDate,
      time: event.time,
      recurrence: event.recurrence,
      weekday: event.weekday,
      sessionCount: event.sessionCount,
    },
    from,
    to
  );

  const now = new Date();
  const reminders: Array<{ minutes: number; index: 1 | 2 }> = [];
  if (event.reminder1MinutesBefore != null) {
    reminders.push({ minutes: event.reminder1MinutesBefore, index: 1 });
  }
  if (event.reminder2MinutesBefore != null) {
    reminders.push({ minutes: event.reminder2MinutesBefore, index: 2 });
  }

  for (const occ of occurrences) {
    const eventAt = combineLocalDateTime(occ.date, occ.time);

    for (const { minutes, index } of reminders) {
      const notifyAt = new Date(eventAt.getTime() - minutes * 60_000);
      if (notifyAt < now) continue;

      const sourceKey = `${prefix}${occ.date}:r${index}`;
      await Notification.findOneAndUpdate(
        { userId, sourceKey },
        {
          $set: {
            babyId: event.babyId,
            type: "reminder",
            title: event.title,
            body: `${reminderLabel(minutes)} · ${occ.time}${event.notes ? ` · ${event.notes}` : ""}`,
            scheduledAt: notifyAt,
            scheduledTime: occ.time,
            read: false,
            href: "/dashboard/journal",
          },
          $unset: { emailSentAt: 1, pushSentAt: 1 },
        },
        { upsert: true }
      );
    }
  }
}

export async function deleteJournalEventNotifications(userId: string, eventId: string) {
  const prefix = journalEventSourcePrefix(eventId);
  await Notification.deleteMany({
    userId,
    sourceKey: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });
}
