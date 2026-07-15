import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { FeedingEntry } from "@/models/FeedingEntry";
import {
  feedingEntryDateKey,
  formatFeedingPeriodLabel,
  getFeedingPeriodRange,
  type FeedingPeriod,
} from "@/utils/date";

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
    const entries = await FeedingEntry.find({
      babyId,
      time: { $gte: start, $lte: end },
    })
      .select("time amount")
      .lean();

    const totalsByDay = new Map<string, number>();
    for (const day of days) totalsByDay.set(day, 0);

    for (const entry of entries) {
      const key = feedingEntryDateKey(entry.time);
      if (totalsByDay.has(key)) {
        totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + (entry.amount ?? 0));
      }
    }

    const dayRows = days.map((date) => ({
      date,
      total: totalsByDay.get(date) ?? 0,
    }));

    const grandTotal = dayRows.reduce((sum, row) => sum + row.total, 0);
    const dailyAverage =
      period === "day" ? grandTotal : Math.round(grandTotal / Math.max(days.length, 1));

    return NextResponse.json({
      period,
      anchorDate: dateStr.split("T")[0],
      periodLabel: formatFeedingPeriodLabel(period, dateStr),
      days: dayRows,
      grandTotal,
      dailyAverage,
      dayCount: days.length,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
