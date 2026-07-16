import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { serializeBaby } from "@/lib/data/serialize-baby";
import { dateOnlyToMongo, getTodayLocal } from "@/utils/date";
import { Baby } from "@/models/Baby";

export async function POST(
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

    const existing = await Baby.findOne({ _id: id, userId: session.user.id });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!existing.solidsStartedAt) {
      existing.solidsStartedAt = dateOnlyToMongo(getTodayLocal());
      await existing.save();
    }

    return NextResponse.json(serializeBaby(existing));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
