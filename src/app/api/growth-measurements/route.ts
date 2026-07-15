import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { growthMeasurementSchema } from "@/lib/validations/modules";
import { GrowthMeasurement } from "@/models/GrowthMeasurement";

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

    if (!(await getOwnedBaby(babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const items = await GrowthMeasurement.find({ babyId }).sort({ date: -1 }).limit(30).lean();

    return NextResponse.json(
      items.map((m) => ({
        _id: String(m._id),
        babyId,
        date: new Date(m.date).toISOString(),
        weight: m.weight,
        height: m.height,
        headCircumference: m.headCircumference,
        notes: m.notes,
        createdAt: new Date(m.createdAt).toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = growthMeasurementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const item = await GrowthMeasurement.create({
      babyId: parsed.data.babyId,
      date: new Date(parsed.data.date),
      weight: parsed.data.weight,
      height: parsed.data.height,
      headCircumference: parsed.data.headCircumference,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      {
        _id: item._id.toString(),
        babyId: parsed.data.babyId,
        date: item.date.toISOString(),
        weight: item.weight,
        height: item.height,
        headCircumference: item.headCircumference,
        notes: item.notes,
        createdAt: item.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
