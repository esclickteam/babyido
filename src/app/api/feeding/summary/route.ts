import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { calculateDailyFormulaAmount } from "@/utils/age";
import { Baby, FeedingEntry, GrowthMeasurement } from "@/models";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    const dateStr = searchParams.get("date");
    const mealsPerDay = Number(searchParams.get("mealsPerDay") ?? 8);

    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    const baby = await getOwnedBaby(babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const day = dateStr ? new Date(dateStr) : new Date();
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    await connectDB();

    const [entries, lastGrowth] = await Promise.all([
      FeedingEntry.find({ babyId, time: { $gte: dayStart, $lte: dayEnd } })
        .sort({ time: -1 })
        .lean(),
      GrowthMeasurement.findOne({ babyId }).sort({ date: -1 }).select("weight").lean(),
    ]);

    const todayTotal = entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const weightGrams = lastGrowth?.weight ?? baby.birthWeight ?? 3500;
    const weightKg = weightGrams / 1000;
    const { dailyTotal, perMeal } = calculateDailyFormulaAmount(weightKg, mealsPerDay);
    const remaining = Math.max(0, dailyTotal - todayTotal);

    return NextResponse.json({
      todayTotal,
      dailyGoal: dailyTotal,
      perMeal,
      remaining,
      lastWeightGrams: weightGrams,
      mealsPerDay,
      entries: entries.map((e) => ({
        _id: String(e._id),
        babyId,
        type: e.type,
        time: new Date(e.time).toISOString(),
        amount: e.amount,
        formulaBrand: e.formulaBrand,
        notes: e.notes,
        createdAt: new Date(e.createdAt).toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
