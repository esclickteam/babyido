import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import {
  tummyTimeEndSchema,
  tummyTimeManualSchema,
  tummyTimeStartSchema,
} from "@/lib/validations/modules";
import { TummyTimeEntry } from "@/models/TummyTimeEntry";
import { feedingDateTimeToMongo } from "@/utils/date";

function serialize(entry: {
  _id: { toString(): string };
  babyId: { toString(): string };
  startTime: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
}) {
  return {
    _id: entry._id.toString(),
    babyId: entry.babyId.toString(),
    startTime: entry.startTime.toISOString(),
    endTime: entry.endTime?.toISOString(),
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
    const entries = await TummyTimeEntry.find({ babyId })
      .sort({ startTime: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(
      entries.map((e) =>
        serialize({
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
      const parsed = tummyTimeManualSchema.safeParse(body);
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
      const entry = await TummyTimeEntry.create({
        babyId: parsed.data.babyId,
        startTime,
        endTime,
        notes: parsed.data.notes,
      });

      return NextResponse.json(serialize(entry), { status: 201 });
    }

    const parsed = tummyTimeStartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const active = await TummyTimeEntry.findOne({ babyId: parsed.data.babyId, endTime: null });
    if (active) {
      return NextResponse.json({ error: "Active tummy time session exists" }, { status: 409 });
    }

    let startTime: Date;
    try {
      startTime = feedingDateTimeToMongo(parsed.data.date, parsed.data.time);
    } catch {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    const entry = await TummyTimeEntry.create({
      babyId: parsed.data.babyId,
      startTime,
      notes: parsed.data.notes,
    });

    return NextResponse.json(serialize(entry), { status: 201 });
  } catch (err) {
    console.error("tummy time create error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
