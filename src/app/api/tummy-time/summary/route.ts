import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { TummyTimeEntry } from "@/models/TummyTimeEntry";
import { feedingEntryDateKey, getFeedingDayRange, getTodayIsrael } from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    const dateStr = searchParams.get("date");

    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    if (!(await getOwnedBaby(babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const dayKey = dateStr ?? getTodayIsrael();
    const { start: dayStart, end: dayEnd } = getFeedingDayRange(dayKey);

    await connectDB();

    const [entries, activeEntry] = await Promise.all([
      TummyTimeEntry.find({
        babyId,
        $or: [
          { startTime: { $gte: dayStart, $lte: dayEnd } },
          { endTime: { $gte: dayStart, $lte: dayEnd } },
        ],
      })
        .sort({ startTime: -1 })
        .lean(),
      TummyTimeEntry.findOne({ babyId, endTime: null }).sort({ startTime: -1 }).lean(),
    ]);

    const serialized = entries.map((e) => ({
      _id: String(e._id),
      babyId,
      startTime: new Date(e.startTime).toISOString(),
      endTime: e.endTime ? new Date(e.endTime).toISOString() : undefined,
      notes: e.notes,
      createdAt: new Date(e.createdAt).toISOString(),
    }));

    let totalMinutes = 0;
    for (const entry of serialized) {
      if (!entry.endTime) continue;
      const endKey = feedingEntryDateKey(entry.endTime);
      if (endKey !== dayKey) continue;
      totalMinutes += sleepDurationMinutes(entry);
    }

    return NextResponse.json({
      totalMinutes,
      entries: serialized,
      activeEntry: activeEntry
        ? {
            _id: String(activeEntry._id),
            babyId,
            startTime: new Date(activeEntry.startTime).toISOString(),
            endTime: undefined,
            notes: activeEntry.notes,
            createdAt: new Date(activeEntry.createdAt).toISOString(),
          }
        : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
