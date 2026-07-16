import type { UserProfile } from "@/types";

export async function fetchUserProfile() {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json() as Promise<UserProfile>;
}

export async function updateNotificationEmail(notificationEmail: string) {
  const res = await fetch("/api/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationEmail }),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json() as Promise<UserProfile>;
}
