import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { syncWellBabyNotification } from "@/lib/notifications/sync-well-baby";
import { wellBabyVisitSchema } from "@/lib/validations/modules";
import { WellBabyVisit } from "@/models/WellBabyVisit";
import { Notification } from "@/models/Notification";
import { wellBabySourceKey } from "@/lib/notifications/sync-well-baby";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";

function serialize(v: {
  _id: { toString(): string };
  babyId: { toString(): string };
  scheduledDate: Date;
  scheduledTime?: string;
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = wellBabyVisitSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const existing = await WellBabyVisit.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await getOwnedBaby(existing.babyId.toString(), session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (parsed.data.scheduledDate) {
      existing.scheduledDate = dateOnlyToMongo(parsed.data.scheduledDate);
    }
    if (parsed.data.scheduledTime !== undefined) {
      existing.scheduledTime = parsed.data.scheduledTime ?? undefined;
    }
    if (parsed.data.clinicName !== undefined) existing.clinicName = parsed.data.clinicName;
    if (parsed.data.notes !== undefined) existing.notes = parsed.data.notes;
    if (parsed.data.reminderEnabled !== undefined) {
      existing.reminderEnabled = parsed.data.reminderEnabled;
    }
    if (parsed.data.completed !== undefined) {
      existing.completed = parsed.data.completed;
      if (parsed.data.completed && !existing.completedDate) {
        existing.completedDate = dateOnlyToMongo(
          parsed.data.completedDate ?? toDateOnlyString(new Date())
        );
      }
      if (!parsed.data.completed) existing.completedDate = undefined;
    }

    await existing.save();

    await syncWellBabyNotification({
      userId: session.user.id,
      babyId: existing.babyId.toString(),
      babyName: baby.name,
      visit: existing,
    });

    return NextResponse.json(serialize(existing));
  } catch (error) {
    console.error("PATCH /api/well-baby-visits/[id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const existing = await WellBabyVisit.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await getOwnedBaby(existing.babyId.toString(), session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await WellBabyVisit.deleteOne({ _id: id });
    await Notification.deleteOne({
      userId: session.user.id,
      sourceKey: wellBabySourceKey(existing.babyId.toString(), id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/well-baby-visits/[id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
