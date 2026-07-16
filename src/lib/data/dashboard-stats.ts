import { connectDB } from "@/lib/db/mongodb";
import { calculateDailyFormulaAmount } from "@/utils/age";
import { getFeedingDayRange, getTodayIsrael } from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";
import { Baby, FeedingEntry, GrowthMeasurement, Milestone, SleepEntry, TastingEntry } from "@/models";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(
  babyId: string,
  userId: string,
  dateStr?: string
): Promise<DashboardStats | null> {
  await connectDB();

  const baby = await Baby.findOne({ _id: babyId, userId }).select("_id birthWeight").lean();
  if (!baby) return null;

  const dayKey = dateStr ?? getTodayIsrael();
  const { start: feedingDayStart, end: feedingDayEnd } = getFeedingDayRange(dayKey);
  const { start: sleepDayStart, end: sleepDayEnd } = getFeedingDayRange(dayKey);

  const [lastGrowth, todayFeedings, todaySleep, lastMilestone, lastTasting] = await Promise.all([
    GrowthMeasurement.findOne({ babyId })
      .sort({ date: -1 })
      .select("weight height headCircumference")
      .lean(),
    FeedingEntry.find({ babyId, time: { $gte: feedingDayStart, $lte: feedingDayEnd } })
      .select("amount")
      .lean(),
    SleepEntry.find({
      babyId,
      endTime: { $ne: null },
      $or: [
        { startTime: { $gte: sleepDayStart, $lte: sleepDayEnd } },
        { endTime: { $gte: sleepDayStart, $lte: sleepDayEnd } },
      ],
    })
      .select("startTime endTime")
      .lean(),
    Milestone.findOne({ babyId }).sort({ date: -1 }).select("type date notes createdAt").lean(),
    TastingEntry.findOne({ babyId })
      .sort({ tastedDate: -1 })
      .select("foodName category tastedDate reactions isAllergen notes isCustom foodId createdAt")
      .lean(),
  ]);

  const todayFeedingAmount = todayFeedings.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const weightKg = lastGrowth?.weight
    ? lastGrowth.weight / 1000
    : (baby.birthWeight ?? 3500) / 1000;
  const { dailyTotal } = calculateDailyFormulaAmount(weightKg, 8);

  const todaySleepMinutes = todaySleep.reduce((sum, s) => {
    if (!s.endTime) return sum;
    return (
      sum +
      sleepDurationMinutes({
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
      })
    );
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
    lastTasting: lastTasting
      ? {
          _id: String(lastTasting._id),
          babyId,
          foodName: lastTasting.foodName,
          category: lastTasting.category,
          tastedDate: lastTasting.tastedDate
            ? new Date(lastTasting.tastedDate).toISOString()
            : undefined,
          reactions: lastTasting.reactions ?? [],
          isAllergen: lastTasting.isAllergen,
          notes: lastTasting.notes,
          isCustom: lastTasting.isCustom,
          foodId: lastTasting.foodId,
          createdAt: new Date(lastTasting.createdAt).toISOString(),
        }
      : undefined,
    nextVaccination: undefined,
    nextWellBabyVisit: undefined,
  };
}
