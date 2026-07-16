import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { syncWellBabyNotification } from "@/lib/notifications/sync-well-baby";
import { wellBabyVisitSchema } from "@/lib/validations/modules";
import { WellBabyVisit } from "@/models/WellBabyVisit";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";

function serialize(v: {
  _id: { toString(): string };
  babyId: { toString(): string };
  scheduledDate: Date;
  scheduledTime?: string;
  visitType?: string;
  clinicName?: string;
  notes?: string;
  completed: boolean;
  completedDate?: Date;
  reminderEnabled: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: v._id.toString(),
    babyId: v.babyId.toString(),
    scheduledDate: toDateOnlyString(v.scheduledDate),
    scheduledTime: v.scheduledTime,
    visitType: v.visitType ?? "tracking",
    clinicName: v.clinicName,
    notes: v.notes,
    completed: v.completed,
    completedDate: v.completedDate ? toDateOnlyString(v.completedDate) : undefined,
    reminderEnabled: v.reminderEnabled,
    reminderSentAt: v.reminderSentAt?.toISOString(),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
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
    const visits = await WellBabyVisit.find({ babyId }).sort({ scheduledDate: 1 }).lean();
    return NextResponse.json(visits.map(serialize));
  } catch (error) {
    console.error("GET /api/well-baby-visits", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = wellBabyVisitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const baby = await getOwnedBaby(parsed.data.babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const visit = await WellBabyVisit.create({
      babyId: parsed.data.babyId,
      scheduledDate: dateOnlyToMongo(parsed.data.scheduledDate),
      scheduledTime: parsed.data.scheduledTime ?? undefined,
      visitType: parsed.data.visitType ?? "tracking",
      clinicName: parsed.data.clinicName,
      notes: parsed.data.notes,
      completed: parsed.data.completed ?? false,
      completedDate: parsed.data.completedDate
        ? dateOnlyToMongo(parsed.data.completedDate)
        : undefined,
      reminderEnabled: parsed.data.reminderEnabled ?? true,
    });

    await syncWellBabyNotification({
      userId: session.user.id,
      babyId: parsed.data.babyId,
      babyName: baby.name,
      visit,
    });

    return NextResponse.json(serialize(visit), { status: 201 });
  } catch (error) {
    console.error("POST /api/well-baby-visits", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
