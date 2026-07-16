import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { SleepEntry } from "@/models/SleepEntry";
import {
  feedingEntryDateKey,
  formatFeedingPeriodLabel,
  getFeedingPeriodRange,
  type FeedingPeriod,
} from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";

const PERIODS = new Set<FeedingPeriod>(["day", "week", "month"]);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    const period = (searchParams.get("period") ?? "day") as FeedingPeriod;
    const dateStr = searchParams.get("date");

    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }
    if (!dateStr) {
      return NextResponse.json({ error: "date required" }, { status: 400 });
    }
    if (!PERIODS.has(period)) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    if (!(await getOwnedBaby(babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { days, start, end } = getFeedingPeriodRange(period, dateStr);

    await connectDB();
    const entries = await SleepEntry.find({
      babyId,
      endTime: { $exists: true, $gte: start, $lte: end },
    })
      .select("startTime endTime type")
      .lean();

    const totalsByDay = new Map<string, { total: number; nap: number; night: number }>();
    for (const day of days) {
      totalsByDay.set(day, { total: 0, nap: 0, night: 0 });
    }

    for (const entry of entries) {
      if (!entry.endTime) continue;
      const key = feedingEntryDateKey(entry.endTime);
      const bucket = totalsByDay.get(key);
      if (!bucket) continue;
      const minutes = sleepDurationMinutes({
        startTime: new Date(entry.startTime).toISOString(),
        endTime: new Date(entry.endTime).toISOString(),
      });
      bucket.total += minutes;
      if (entry.type === "nap") bucket.nap += minutes;
      else bucket.night += minutes;
    }

    const dayRows = days.map((date) => {
      const row = totalsByDay.get(date) ?? { total: 0, nap: 0, night: 0 };
      return { date, total: row.total, napTotal: row.nap, nightTotal: row.night };
    });

    const grandTotal = dayRows.reduce((sum, row) => sum + row.total, 0);
    const napGrandTotal = dayRows.reduce((sum, row) => sum + row.napTotal, 0);
    const nightGrandTotal = dayRows.reduce((sum, row) => sum + row.nightTotal, 0);
    const dailyAverage =
      period === "day" ? grandTotal : Math.round(grandTotal / Math.max(days.length, 1));

    return NextResponse.json({
      period,
      anchorDate: dateStr.split("T")[0],
      periodLabel: formatFeedingPeriodLabel(period, dateStr),
      days: dayRows,
      grandTotal,
      napGrandTotal,
      nightGrandTotal,
      dailyAverage,
      dayCount: days.length,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
