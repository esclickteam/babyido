"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";
import type { AppNotification } from "@/types";

const alerted = new Set<string>();

function shouldAlert(item: AppNotification): boolean {
  const scheduled = new Date(item.scheduledAt).getTime();
  const now = Date.now();
  return scheduled <= now && !item.read;
}

function showLocalNotification(item: AppNotification) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const tag = item._id;
  if (alerted.has(tag)) return;
  alerted.add(tag);

  try {
    new Notification(item.title, {
      body: item.body,
      icon: "/web-app-manifest-192x192.png",
      tag,
      dir: "rtl",
      lang: "he",
    });
  } catch {
    // ignore — mobile browsers may block non-sw notifications
  }

  toast.info(item.title, { description: item.body, duration: 8000 });
}

/** Polls notifications and fires browser toasts/alerts when a reminder is due. */
export function useReminderAlerts() {
  const { data } = useNotifications();
  const items = data?.items ?? [];
  const prevCount = useRef(0);

  useEffect(() => {
    for (const item of items) {
      if (shouldAlert(item)) {
        showLocalNotification(item);
      }
    }

    const dueCount = items.filter(shouldAlert).length;
    if (dueCount > prevCount.current && prevCount.current > 0) {
      // new due items since last poll
    }
    prevCount.current = dueCount;
  }, [items]);
}
