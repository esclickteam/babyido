import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { dispatchPushForNotification } from "@/lib/notifications/dispatch";
import { isPushConfigured } from "@/lib/push/web-push";
import { Notification } from "@/models/Notification";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ ok: true, skipped: "push not configured" });
  }

  try {
    await connectDB();
    const now = new Date();
    const due = await Notification.find({
      scheduledAt: { $lte: now },
      $or: [{ pushSentAt: { $exists: false } }, { pushSentAt: null }],
    })
      .limit(50)
      .lean();

    let sent = 0;

    for (const item of due) {
      const result = await dispatchPushForNotification(String(item.userId), {
        title: item.title,
        body: item.body,
        href: item.href,
        sourceKey: item.sourceKey,
      });

      if (result.sent > 0) {
        await Notification.updateOne({ _id: item._id }, { $set: { pushSentAt: now } });
        sent += 1;
      } else if (result.removed > 0) {
        await Notification.updateOne({ _id: item._id }, { $set: { pushSentAt: now } });
      }
    }

    return NextResponse.json({ ok: true, processed: due.length, sent });
  } catch (err) {
    console.error("[cron] notification-dispatch", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
