import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import {
  sleepEndSchema,
  sleepManualSchema,
  sleepStartSchema,
} from "@/lib/validations/modules";
import { SleepEntry } from "@/models/SleepEntry";
import { feedingDateTimeToMongo } from "@/utils/date";

function serializeSleepEntry(entry: {
  _id: { toString(): string };
  babyId: { toString(): string };
  startTime: Date;
  endTime?: Date;
  type: "night" | "nap";
  notes?: string;
  createdAt: Date;
}) {
  return {
    _id: entry._id.toString(),
    babyId: entry.babyId.toString(),
    startTime: entry.startTime.toISOString(),
    endTime: entry.endTime?.toISOString(),
    type: entry.type,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
  };
}

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
    const entries = await SleepEntry.find({ babyId }).sort({ startTime: -1 }).limit(100).lean();

    return NextResponse.json(
      entries.map((e) =>
        serializeSleepEntry({
          ...e,
          _id: { toString: () => String(e._id) },
          babyId: { toString: () => String(e.babyId) },
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : undefined,
          createdAt: new Date(e.createdAt),
        })
      )
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

    if (body.startDate && body.endDate) {
      const parsed = sleepManualSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      let startTime: Date;
      let endTime: Date;
      try {
        startTime = feedingDateTimeToMongo(parsed.data.startDate, parsed.data.startTime);
        endTime = feedingDateTimeToMongo(parsed.data.endDate, parsed.data.endTime);
      } catch {
        return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
      }

      if (endTime <= startTime) {
        return NextResponse.json({ error: "End must be after start" }, { status: 400 });
      }

      await connectDB();
      const entry = await SleepEntry.create({
        babyId: parsed.data.babyId,
        type: parsed.data.type,
        startTime,
        endTime,
        notes: parsed.data.notes,
      });

      return NextResponse.json(serializeSleepEntry(entry), { status: 201 });
    }

    const parsed = sleepStartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const active = await SleepEntry.findOne({ babyId: parsed.data.babyId, endTime: null });
    if (active) {
      return NextResponse.json({ error: "Active sleep session exists" }, { status: 409 });
    }

    let startTime: Date;
    try {
      startTime = feedingDateTimeToMongo(parsed.data.date, parsed.data.time);
    } catch {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    const entry = await SleepEntry.create({
      babyId: parsed.data.babyId,
      type: parsed.data.type,
      startTime,
      notes: parsed.data.notes,
    });

    return NextResponse.json(serializeSleepEntry(entry), { status: 201 });
  } catch (err) {
    console.error("sleep entry create error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
