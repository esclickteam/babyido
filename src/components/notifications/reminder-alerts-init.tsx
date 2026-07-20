"use client";

import { useReminderAlerts } from "@/hooks/use-reminder-alerts";

/** Mounts background polling + local alerts for due reminders. */
export function ReminderAlertsInit() {
  useReminderAlerts();
  return null;
}
