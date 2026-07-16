import type { AppNotification, UserProfile } from "@/types";

export async function fetchNotifications() {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json() as Promise<{
    items: AppNotification[];
    unreadCount: number;
    upcomingCount: number;
  }>;
}

export async function markNotificationsRead(ids?: string[], markAll?: boolean) {
  const res = await fetch("/api/notifications", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, markAll }),
  });
  if (!res.ok) throw new Error("Failed to update notifications");
  return res.json();
}
