import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { PushSubscription } from "@/models/PushSubscription";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    await connectDB();

    const userAgent = request.headers.get("user-agent") ?? undefined;

    await PushSubscription.findOneAndUpdate(
      { endpoint: parsed.data.endpoint },
      {
        userId: session.user.id,
        endpoint: parsed.data.endpoint,
        keys: parsed.data.keys,
        userAgent,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
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

    const body = await request.json().catch(() => ({}));
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;

    await connectDB();

    if (endpoint) {
      await PushSubscription.deleteOne({ userId: session.user.id, endpoint });
    } else {
      await PushSubscription.deleteMany({ userId: session.user.id });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
