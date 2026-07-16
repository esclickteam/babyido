import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { sleepEndSchema } from "@/lib/validations/modules";
import { SleepEntry } from "@/models/SleepEntry";
import { Baby } from "@/models/Baby";
import { feedingDateTimeToMongo } from "@/utils/date";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const entry = await SleepEntry.findById(id).lean();
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await Baby.findOne({ _id: entry.babyId, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await SleepEntry.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = sleepEndSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();
    const entry = await SleepEntry.findById(id);
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await Baby.findOne({ _id: entry.babyId, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (entry.endTime) {
      return NextResponse.json({ error: "Sleep already ended" }, { status: 400 });
    }

    let endTime: Date;
    try {
      endTime = feedingDateTimeToMongo(parsed.data.date, parsed.data.time);
    } catch {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    if (endTime <= entry.startTime) {
      return NextResponse.json({ error: "End must be after start" }, { status: 400 });
    }

    entry.endTime = endTime;
    await entry.save();

    return NextResponse.json({
      _id: entry._id.toString(),
      babyId: entry.babyId.toString(),
      startTime: entry.startTime.toISOString(),
      endTime: entry.endTime.toISOString(),
      type: entry.type,
      notes: entry.notes,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
