import { addDays, addWeeks, parseISO, startOfDay } from "date-fns";
import { toDateOnlyString } from "@/utils/date";

export interface JournalOccurrenceSource {
  startDate: string;
  time: string;
  recurrence: "once" | "weekly" | "sessions";
  weekday: number;
  sessionCount?: number;
}

export function expandJournalOccurrences(
  event: JournalOccurrenceSource,
  from: string,
  to: string
): Array<{ date: string; time: string }> {
  const fromD = startOfDay(parseISO(from));
  const toD = startOfDay(parseISO(to));
  const start = startOfDay(parseISO(event.startDate));
  const occurrences: Array<{ date: string; time: string }> = [];

  if (event.recurrence === "once") {
    if (event.startDate >= from && event.startDate <= to) {
      occurrences.push({ date: event.startDate, time: event.time });
    }
    return occurrences;
  }

  if (event.recurrence === "weekly") {
    let d = fromD > start ? fromD : start;
    while (d <= toD) {
      if (d.getDay() === event.weekday && d >= start) {
        occurrences.push({ date: toDateOnlyString(d), time: event.time });
      }
      d = addDays(d, 1);
    }
    return occurrences;
  }

  const count = event.sessionCount ?? 1;
  let d = start;
  for (let i = 0; i < count; i++) {
    const dateStr = toDateOnlyString(d);
    if (dateStr >= from && dateStr <= to) {
      occurrences.push({ date: dateStr, time: event.time });
    }
    d = addWeeks(d, 1);
  }

  return occurrences;
}
