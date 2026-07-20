import type { INotification } from "@/models/Notification";
import { PushSubscription } from "@/models/PushSubscription";
import { sendWebPush, isPushConfigured } from "@/lib/push/web-push";

export async function dispatchPushForNotification(
  userId: string,
  notification: Pick<INotification, "title" | "body" | "href" | "sourceKey">
): Promise<{ sent: number; removed: number }> {
  if (!isPushConfigured()) return { sent: 0, removed: 0 };

  const subs = await PushSubscription.find({ userId }).lean();
  let sent = 0;
  let removed = 0;

  for (const sub of subs) {
    try {
      const ok = await sendWebPush(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        {
          title: notification.title,
          body: notification.body,
          href: notification.href,
          tag: notification.sourceKey,
        }
      );
      if (ok) sent += 1;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await PushSubscription.deleteOne({ _id: sub._id });
        removed += 1;
      }
    }
  }

  return { sent, removed };
}
