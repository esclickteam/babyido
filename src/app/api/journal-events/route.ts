import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { getAuthUserId } from "@/lib/auth/session-user";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { syncJournalEventNotifications } from "@/lib/notifications/sync-journal-event";
import { JournalEvent } from "@/models/JournalEvent";
import { dateOnlyToMongo, parseTimeInput, toDateOnlyString } from "@/utils/date";

const createSchema = z.object({
  babyId: z.string().min(1),
  title: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  recurrence: z.enum(["once", "weekly", "sessions"]),
  sessionCount: z.number().int().min(1).max(52).optional(),
  remindersEnabled: z.boolean().optional(),
  reminder1MinutesBefore: z.number().int().min(0).optional(),
  reminder2MinutesBefore: z.number().int().min(0).optional(),
});

function parseStartDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = getAuthUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    const baby = await getOwnedBaby(babyId, userId);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const items = await JournalEvent.find({ babyId, userId }).sort({ startDate: 1 }).lean();

    return NextResponse.json({
      items: items.map((e) => ({
        _id: String(e._id),
        babyId: String(e.babyId),
        title: e.title,
        notes: e.notes,
        startDate: toDateOnlyString(e.startDate),
        time: e.time,
        recurrence: e.recurrence,
        weekday: e.weekday,
        sessionCount: e.sessionCount,
        remindersEnabled: e.remindersEnabled,
        reminder1MinutesBefore: e.reminder1MinutesBefore,
        reminder2MinutesBefore: e.reminder2MinutesBefore,
      })),
    });
  } catch (error) {
    console.error("GET /api/journal-events", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = getAuthUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;
    const baby = await getOwnedBaby(data.babyId, userId);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const timeParsed = parseTimeInput(data.time.length === 5 ? `${data.time}:00` : data.time);
    if (!timeParsed) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }

    const startLocal = parseStartDate(data.date);
    const time = `${String(timeParsed.hours).padStart(2, "0")}:${String(timeParsed.minutes).padStart(2, "0")}`;

    await connectDB();

    const event = await JournalEvent.create({
      userId,
      babyId: data.babyId,
      title: data.title.trim(),
      notes: data.notes?.trim(),
      startDate: dateOnlyToMongo(data.date),
      time,
      recurrence: data.recurrence,
      weekday: startLocal.getDay(),
      sessionCount: data.recurrence === "sessions" ? data.sessionCount ?? 1 : undefined,
      remindersEnabled: data.remindersEnabled ?? true,
      reminder1MinutesBefore: data.reminder1MinutesBefore ?? 60,
      reminder2MinutesBefore: data.reminder2MinutesBefore,
    });

    await syncJournalEventNotifications(userId, event);

    return NextResponse.json({ _id: event._id.toString() });
  } catch (error) {
    console.error("POST /api/journal-events", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
