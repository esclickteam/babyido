import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { dispatchPushForNotification } from "@/lib/notifications/dispatch";
import { Notification } from "@/models/Notification";
import { combineLocalDateTime } from "@/utils/date";

const createSchema = z.object({
  babyId: z.string().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  notifyNow: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const items = await Notification.find({
      userId: session.user.id,
      type: "custom",
    })
      .sort({ scheduledAt: 1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      items: items.map((n) => ({
        _id: String(n._id),
        title: n.title,
        body: n.body,
        scheduledAt: new Date(n.scheduledAt).toISOString(),
        scheduledTime: n.scheduledTime,
        read: n.read,
        href: n.href,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { babyId, title, body: reminderBody, date, time, notifyNow } = parsed.data;
    const scheduledAt = combineLocalDateTime(date, time);
    const sourceKey = `custom:${session.user.id}:${Date.now()}`;

    await connectDB();

    const notification = await Notification.create({
      userId: session.user.id,
      babyId: babyId || undefined,
      type: "custom",
      title,
      body: reminderBody,
      scheduledAt,
      scheduledTime: time.length > 5 ? time.slice(0, 8) : time,
      read: false,
      sourceKey,
      href: "/dashboard/reminders",
    });

    const now = new Date();
    if (notifyNow || scheduledAt <= now) {
      await dispatchPushForNotification(session.user.id, notification);
      notification.pushSentAt = new Date();
      await notification.save();
    }

    return NextResponse.json({
      _id: notification._id.toString(),
      scheduledAt: notification.scheduledAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await connectDB();
    await Notification.deleteOne({ _id: id, userId: session.user.id, type: "custom" });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
