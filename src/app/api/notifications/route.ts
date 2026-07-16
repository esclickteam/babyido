import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { Notification } from "@/models/Notification";
import type { AppNotification } from "@/types";

function serialize(n: {
  _id: { toString(): string };
  userId: { toString(): string };
  babyId?: { toString(): string };
  type: string;
  title: string;
  body: string;
  scheduledAt: Date;
  scheduledTime?: string;
  read: boolean;
  emailSentAt?: Date;
  href?: string;
  createdAt: Date;
}): AppNotification {
  return {
    _id: n._id.toString(),
    userId: n.userId.toString(),
    babyId: n.babyId?.toString(),
    type: n.type as AppNotification["type"],
    title: n.title,
    body: n.body,
    scheduledAt: n.scheduledAt.toISOString(),
    scheduledTime: n.scheduledTime,
    read: n.read,
    emailSentAt: n.emailSentAt?.toISOString(),
    href: n.href,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();
    const items = await Notification.find({ userId: session.user.id })
      .sort({ scheduledAt: 1 })
      .limit(50)
      .lean();

    const upcoming = items.filter((n) => new Date(n.scheduledAt) >= now);
    const unreadCount = items.filter((n) => !n.read).length;

    return NextResponse.json({
      items: items.map((n) =>
        serialize({
          ...n,
          _id: { toString: () => String(n._id) },
          userId: { toString: () => String(n.userId) },
          babyId: n.babyId ? { toString: () => String(n.babyId) } : undefined,
          scheduledAt: new Date(n.scheduledAt),
          emailSentAt: n.emailSentAt ? new Date(n.emailSentAt) : undefined,
          createdAt: new Date(n.createdAt),
        })
      ),
      unreadCount,
      upcomingCount: upcoming.length,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const ids: string[] | undefined = body.ids;
    const markAll = body.markAll === true;

    await connectDB();

    if (markAll) {
      await Notification.updateMany({ userId: session.user.id, read: false }, { $set: { read: true } });
    } else if (ids?.length) {
      await Notification.updateMany(
        { userId: session.user.id, _id: { $in: ids } },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
