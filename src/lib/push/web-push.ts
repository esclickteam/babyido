import webpush from "web-push";

export function isPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

function ensureConfigured(): boolean {
  if (!isPushConfigured()) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:hello@babyido.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
}

export async function sendWebPush(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; href?: string; tag?: string }
): Promise<boolean> {
  if (!ensureConfigured()) return false;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        href: payload.href ?? "/dashboard/reminders",
        tag: payload.tag,
      })
    );
    return true;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      throw err;
    }
    console.error("[push] send failed", err);
    return false;
  }
}
