import { endOfDay, startOfDay } from "date-fns";
import { connectDB } from "@/lib/db/mongodb";
import { calculateDailyFormulaAmount } from "@/utils/age";
import { Baby, FeedingEntry, GrowthMeasurement, Milestone, SleepEntry } from "@/models";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(
  babyId: string,
  userId: string
): Promise<DashboardStats | null> {
  await connectDB();

  const baby = await Baby.findOne({ _id: babyId, userId }).select("_id birthWeight").lean();
  if (!baby) return null;

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [lastGrowth, todayFeedings, todaySleep, lastMilestone] = await Promise.all([
    GrowthMeasurement.findOne({ babyId })
      .sort({ date: -1 })
      .select("weight height headCircumference")
      .lean(),
    FeedingEntry.find({ babyId, time: { $gte: dayStart, $lte: dayEnd } })
      .select("amount")
      .lean(),
    SleepEntry.find({
      babyId,
      $or: [
        { startTime: { $gte: dayStart, $lte: dayEnd } },
        { endTime: { $gte: dayStart, $lte: dayEnd } },
      ],
    })
      .select("startTime endTime")
      .lean(),
    Milestone.findOne({ babyId }).sort({ date: -1 }).select("type date notes createdAt").lean(),
  ]);

  const todayFeedingAmount = todayFeedings.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const weightKg = lastGrowth?.weight
    ? lastGrowth.weight / 1000
    : (baby.birthWeight ?? 3500) / 1000;
  const { dailyTotal } = calculateDailyFormulaAmount(weightKg, 8);

  const todaySleepMinutes = todaySleep.reduce((sum, s) => {
    if (!s.endTime) return sum;
    const start = new Date(s.startTime).getTime();
    const end = new Date(s.endTime).getTime();
    return sum + Math.max(0, Math.round((end - start) / 60000));
  }, 0);

  return {
    todayFeedingAmount,
    dailyFeedingGoal: dailyTotal,
    todaySleepMinutes,
    lastWeight: lastGrowth?.weight,
    lastHeight: lastGrowth?.height,
    lastHeadCircumference: lastGrowth?.headCircumference,
    lastMilestone: lastMilestone
      ? {
          _id: String(lastMilestone._id),
          babyId,
          type: lastMilestone.type,
          date: new Date(lastMilestone.date).toISOString(),
          notes: lastMilestone.notes,
          createdAt: new Date(lastMilestone.createdAt).toISOString(),
        }
      : undefined,
    nextVaccination: undefined,
    nextWellBabyVisit: undefined,
  };
}
