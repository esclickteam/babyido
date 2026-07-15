import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { feedingEntrySchema } from "@/lib/validations/modules";
import { FeedingEntry } from "@/models/FeedingEntry";
import { feedingDateTimeToMongo } from "@/utils/date";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const babyId = new URL(request.url).searchParams.get("babyId");
    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    if (!(await getOwnedBaby(babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const entries = await FeedingEntry.find({ babyId }).sort({ time: -1 }).limit(50).lean();

    return NextResponse.json(
      entries.map((e) => ({
        _id: String(e._id),
        babyId,
        type: e.type,
        time: new Date(e.time).toISOString(),
        amount: e.amount,
        formulaBrand: e.formulaBrand,
        notes: e.notes,
        createdAt: new Date(e.createdAt).toISOString(),
      }))
    );
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
    const parsed = feedingEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let storedTime: Date;
    try {
      storedTime = feedingDateTimeToMongo(parsed.data.date, parsed.data.time);
    } catch {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    await connectDB();
    const entry = await FeedingEntry.create({
      babyId: parsed.data.babyId,
      type: parsed.data.type,
      time: storedTime,
      amount: parsed.data.amount,
      formulaBrand: parsed.data.formulaBrand,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      {
        _id: entry._id.toString(),
        babyId: parsed.data.babyId,
        type: entry.type,
        time: entry.time.toISOString(),
        amount: entry.amount,
        formulaBrand: entry.formulaBrand,
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("feeding entry create error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
