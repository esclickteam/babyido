import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";
import { tastingEntrySchema } from "@/lib/validations/modules";
import { TastingEntry } from "@/models/TastingEntry";

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
    const items = await TastingEntry.find({ babyId }).sort({ tastedDate: -1 }).lean();

    return NextResponse.json(
      items.map((t) => ({
        _id: String(t._id),
        babyId,
        foodName: t.foodName,
        category: t.category,
        tastedDate: t.tastedDate ? toDateOnlyString(t.tastedDate) : undefined,
        reactions: t.reactions ?? [],
        isAllergen: t.isAllergen,
        recommendedAge: t.recommendedAge,
        notes: t.notes,
        isCustom: t.isCustom,
        foodId: t.foodId,
        createdAt: new Date(t.createdAt).toISOString(),
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
    const parsed = tastingEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!(await getOwnedBaby(parsed.data.babyId, session.user.id))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const tastedDateStr = toDateOnlyString(parsed.data.tastedDate);
    const item = await TastingEntry.create({
      babyId: parsed.data.babyId,
      foodName: parsed.data.foodName,
      category: parsed.data.category,
      tastedDate: dateOnlyToMongo(tastedDateStr),
      reactions: parsed.data.reactions ?? [],
      isAllergen: parsed.data.isAllergen,
      recommendedAge: parsed.data.recommendedAge,
      notes: parsed.data.notes,
      isCustom: parsed.data.isCustom,
      foodId: parsed.data.foodId ?? parsed.data.foodName,
    });

    return NextResponse.json(
      {
        _id: item._id.toString(),
        babyId: parsed.data.babyId,
        foodName: item.foodName,
        category: item.category,
        tastedDate: tastedDateStr,
        reactions: item.reactions,
        isAllergen: item.isAllergen,
        recommendedAge: item.recommendedAge,
        notes: item.notes,
        isCustom: item.isCustom,
        foodId: item.foodId,
        createdAt: item.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
