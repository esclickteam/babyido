import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import {
  MILESTONE_SCHEDULE,
  getMilestoneById,
  type MilestoneCategory,
} from "@/constants/milestones";
import { milestoneRecordSchema } from "@/lib/validations/modules";
import { Milestone } from "@/models/Milestone";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";
import { getMilestoneStatus } from "@/utils/milestone-status";

function serializeRecord(r: {
  _id: { toString(): string };
  babyId: { toString(): string };
  milestoneId: string;
  date: Date;
  photoUrl?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: Date;
}) {
  return {
    _id: r._id.toString(),
    babyId: r.babyId.toString(),
    milestoneId: r.milestoneId,
    date: toDateOnlyString(r.date),
    photoUrl: r.photoUrl,
    videoUrl: r.videoUrl,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const babyId = new URL(request.url).searchParams.get("babyId");
    const category = new URL(request.url).searchParams.get("category") as MilestoneCategory | null;

    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    const baby = await getOwnedBaby(babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const records = await Milestone.find({ babyId }).lean();
    const birthDate = toDateOnlyString(baby.birthDate);
    const recordMap = new Map(records.map((r) => [r.milestoneId, r]));

    const schedule = MILESTONE_SCHEDULE.filter(
      (m) => !category || m.category === category
    ).map((milestone) => {
      const record = recordMap.get(milestone.id);
      const serialized = record
        ? serializeRecord({
            ...record,
            _id: { toString: () => String(record._id) },
            babyId: { toString: () => String(record.babyId) },
            date: new Date(record.date),
            createdAt: new Date(record.createdAt),
          })
        : null;
      return {
        milestone,
        record: serialized,
        status: getMilestoneStatus(birthDate, milestone, serialized),
      };
    });

    const completedCount = schedule.filter((s) => s.record).length;
    const expectedSoon = schedule.filter((s) => s.status === "expected_soon" && !s.record);

    return NextResponse.json({
      birthDate,
      schedule,
      completedCount,
      totalCount: schedule.length,
      expectedSoonCount: expectedSoon.length,
      nextExpected: expectedSoon[0] ?? null,
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
    const parsed = milestoneRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!getMilestoneById(parsed.data.milestoneId)) {
      return NextResponse.json({ error: "Unknown milestone" }, { status: 400 });
    }

    await connectDB();

    if (parsed.data.completed === false) {
      await Milestone.deleteOne({
        babyId: parsed.data.babyId,
        milestoneId: parsed.data.milestoneId,
      });
      return NextResponse.json({ deleted: true });
    }

    const record = await Milestone.findOneAndUpdate(
      { babyId: parsed.data.babyId, milestoneId: parsed.data.milestoneId },
      {
        $set: {
          date: dateOnlyToMongo(parsed.data.date),
          photoUrl: parsed.data.photoUrl || undefined,
          videoUrl: parsed.data.videoUrl || undefined,
          notes: parsed.data.notes || undefined,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(serializeRecord(record));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
