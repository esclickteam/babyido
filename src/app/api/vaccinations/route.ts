import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { VACCINE_SCHEDULE, getVaccineById } from "@/constants/vaccinations";
import { vaccinationRecordSchema } from "@/lib/validations/modules";
import { VaccinationRecord } from "@/models/VaccinationRecord";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";
import { getRecommendedVaccineDate } from "@/utils/vaccination-schedule";
import { Baby } from "@/models/Baby";

function serializeRecord(r: {
  _id: { toString(): string };
  babyId: { toString(): string };
  vaccineId: string;
  scheduledDate?: Date;
  completed: boolean;
  completedDate?: Date;
  notes?: string;
  sideEffects?: string;
  reminderEnabled: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: r._id.toString(),
    babyId: r.babyId.toString(),
    vaccineId: r.vaccineId,
    scheduledDate: r.scheduledDate ? toDateOnlyString(r.scheduledDate) : undefined,
    completed: r.completed,
    completedDate: r.completedDate ? toDateOnlyString(r.completedDate) : undefined,
    notes: r.notes,
    sideEffects: r.sideEffects,
    reminderEnabled: r.reminderEnabled,
    reminderSentAt: r.reminderSentAt?.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
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

    const baby = await getOwnedBaby(babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const records = await VaccinationRecord.find({ babyId }).lean();
    const birthDate = toDateOnlyString(baby.birthDate);

    const recordMap = new Map(records.map((r) => [r.vaccineId, r]));

    const schedule = VACCINE_SCHEDULE.map((vaccine) => {
      const record = recordMap.get(vaccine.id);
      const recommendedDate = getRecommendedVaccineDate(birthDate, vaccine);
      return {
        vaccine,
        recommendedDate,
        record: record
          ? serializeRecord({
              ...record,
              _id: { toString: () => String(record._id) },
              babyId: { toString: () => String(record.babyId) },
              scheduledDate: record.scheduledDate ? new Date(record.scheduledDate) : undefined,
              completedDate: record.completedDate ? new Date(record.completedDate) : undefined,
              reminderSentAt: record.reminderSentAt ? new Date(record.reminderSentAt) : undefined,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt),
            })
          : null,
      };
    });

    const completedCount = schedule.filter((s) => s.record?.completed).length;

    return NextResponse.json({
      birthDate,
      schedule,
      completedCount,
      totalCount: VACCINE_SCHEDULE.length,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = vaccinationRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!getVaccineById(parsed.data.vaccineId)) {
      return NextResponse.json({ error: "Unknown vaccine" }, { status: 400 });
    }

    await connectDB();

    const update: Record<string, unknown> = {};
    if (parsed.data.scheduledDate !== undefined) {
      update.scheduledDate = parsed.data.scheduledDate
        ? dateOnlyToMongo(parsed.data.scheduledDate)
        : null;
      update.reminderSentAt = null;
    }
    if (parsed.data.completed !== undefined) update.completed = parsed.data.completed;
    if (parsed.data.completedDate !== undefined) {
      update.completedDate = parsed.data.completedDate
        ? dateOnlyToMongo(parsed.data.completedDate)
        : null;
    }
    if (parsed.data.notes !== undefined) update.notes = parsed.data.notes || undefined;
    if (parsed.data.sideEffects !== undefined) {
      update.sideEffects = parsed.data.sideEffects || undefined;
    }
    if (parsed.data.reminderEnabled !== undefined) {
      update.reminderEnabled = parsed.data.reminderEnabled;
    }

    const record = await VaccinationRecord.findOneAndUpdate(
      { babyId: parsed.data.babyId, vaccineId: parsed.data.vaccineId },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json(serializeRecord(record));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
