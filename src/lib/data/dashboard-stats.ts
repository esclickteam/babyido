import { connectDB } from "@/lib/db/mongodb";
import { VACCINE_SCHEDULE, getVaccineById } from "@/constants/vaccinations";
import { getMilestoneById } from "@/constants/milestones";
import { calculateDailyFormulaAmount } from "@/utils/age";
import { getFeedingDayRange, getTodayIsrael, toDateOnlyString } from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";
import { getRecommendedVaccineDate } from "@/utils/vaccination-schedule";
import {
  Baby,
  FeedingEntry,
  GrowthMeasurement,
  Milestone,
  SleepEntry,
  TastingEntry,
  TummyTimeEntry,
  VaccinationRecord,
} from "@/models";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(
  babyId: string,
  userId: string,
  dateStr?: string
): Promise<DashboardStats | null> {
  await connectDB();

  const baby = await Baby.findOne({ _id: babyId, userId }).select("_id birthWeight birthDate").lean();
  if (!baby) return null;

  const dayKey = dateStr ?? getTodayIsrael();
  const { start: feedingDayStart, end: feedingDayEnd } = getFeedingDayRange(dayKey);
  const { start: sleepDayStart, end: sleepDayEnd } = getFeedingDayRange(dayKey);

  const [lastGrowth, todayFeedings, todaySleep, todayTummy, lastMilestone, lastTasting, vaccinationRecords] =
    await Promise.all([
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
    TummyTimeEntry.find({
      babyId,
      endTime: { $ne: null },
      $or: [
        { startTime: { $gte: sleepDayStart, $lte: sleepDayEnd } },
        { endTime: { $gte: sleepDayStart, $lte: sleepDayEnd } },
      ],
    })
      .select("startTime endTime")
      .lean(),
    Milestone.findOne({ babyId }).sort({ date: -1 }).select("milestoneId date").lean(),
    TastingEntry.findOne({ babyId })
      .sort({ tastedDate: -1 })
      .select("foodName category tastedDate reactions isAllergen notes isCustom foodId createdAt")
      .lean(),
    VaccinationRecord.find({ babyId }).lean(),
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

  const todayTummyTimeMinutes = todayTummy.reduce((sum, e) => {
    if (!e.endTime) return sum;
    return (
      sum +
      sleepDurationMinutes({
        startTime: new Date(e.startTime).toISOString(),
        endTime: new Date(e.endTime).toISOString(),
      })
    );
  }, 0);

  const birthDateStr = toDateOnlyString(baby.birthDate);
  const recordMap = new Map(vaccinationRecords.map((r) => [r.vaccineId, r]));
  let nextVaccination:
    | { vaccineId: string; nameHe: string; scheduledDate?: string; recommendedDate: string }
    | undefined;

  for (const vaccine of VACCINE_SCHEDULE) {
    if (vaccine.optional) continue;
    const record = recordMap.get(vaccine.id);
    if (record?.completed) continue;
    const recommendedDate = getRecommendedVaccineDate(birthDateStr, vaccine);
    nextVaccination = {
      vaccineId: vaccine.id,
      nameHe: `${vaccine.nameHe} (${vaccine.doseHe})`,
      scheduledDate: record?.scheduledDate
        ? toDateOnlyString(record.scheduledDate)
        : undefined,
      recommendedDate,
    };
    break;
  }

  return {
    todayFeedingAmount,
    dailyFeedingGoal: dailyTotal,
    todaySleepMinutes,
    lastWeight: lastGrowth?.weight,
    lastHeight: lastGrowth?.height,
    lastHeadCircumference: lastGrowth?.headCircumference,
    lastMilestone: lastMilestone
      ? {
          milestoneId: lastMilestone.milestoneId,
          titleHe:
            getMilestoneById(lastMilestone.milestoneId)?.titleHe ?? lastMilestone.milestoneId,
          date: toDateOnlyString(lastMilestone.date),
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
    nextVaccination,
    nextWellBabyVisit: undefined,
    todayTummyTimeMinutes,
  };
}
