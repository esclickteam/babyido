import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { getVaccineById } from "@/constants/vaccinations";
import { VaccinationRecord } from "@/models/VaccinationRecord";
import { WellBabyVisit } from "@/models/WellBabyVisit";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";
import type { CalendarEvent } from "@/types";

function serializeWellBaby(v: {
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

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!babyId || !from || !to) {
      return NextResponse.json({ error: "babyId, from, to required" }, { status: 400 });
    }

    const baby = await getOwnedBaby(babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const fromDate = dateOnlyToMongo(from);
    const toDate = dateOnlyToMongo(to);

    const [vaccinations, wellBabyVisits] = await Promise.all([
      VaccinationRecord.find({
        babyId,
        scheduledDate: { $gte: fromDate, $lte: toDate },
      }).lean(),
      WellBabyVisit.find({
        babyId,
        scheduledDate: { $gte: fromDate, $lte: toDate },
      }).lean(),
    ]);

    const events: CalendarEvent[] = [];

    for (const record of vaccinations) {
      const vaccine = getVaccineById(record.vaccineId);
      if (!vaccine || !record.scheduledDate) continue;
      events.push({
        id: `vaccination-${record.vaccineId}`,
        type: "vaccination",
        date: toDateOnlyString(record.scheduledDate),
        time: record.scheduledTime ?? undefined,
        title: `${vaccine.nameHe} · ${vaccine.doseHe}`,
        subtitle: vaccine.descriptionHe.slice(0, 80),
        completed: record.completed,
        href: "/dashboard/vaccinations",
      });
    }

    for (const visit of wellBabyVisits) {
      events.push({
        id: `well-baby-${visit._id}`,
        type: "wellBaby",
        date: toDateOnlyString(visit.scheduledDate),
        time: visit.scheduledTime ?? undefined,
        title: visit.clinicName || "טיפת חלב",
        subtitle: visit.notes?.slice(0, 80),
        completed: visit.completed,
        href: "/dashboard/well-baby",
      });
    }

    events.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });

    return NextResponse.json({ events, wellBabyVisits: wellBabyVisits.map(serializeWellBaby) });
  } catch (error) {
    console.error("GET /api/calendar", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
