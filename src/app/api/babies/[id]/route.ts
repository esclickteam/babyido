import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { dateOnlyToMongo, toDateOnlyString } from "@/utils/date";
import { babySchema } from "@/lib/validations/baby";
import { Baby } from "@/models/Baby";

function serializeBaby(baby: InstanceType<typeof Baby>) {
  return {
    _id: baby._id.toString(),
    userId: baby.userId.toString(),
    name: baby.name,
    photoUrl: baby.photoUrl,
    birthDate: toDateOnlyString(baby.birthDate),
    birthTime: baby.birthTime,
    gender: baby.gender,
    gestationalWeek: baby.gestationalWeek,
    birthWeight: baby.birthWeight,
    birthHeight: baby.birthHeight,
    birthHeadCircumference: baby.birthHeadCircumference,
    birthType: baby.birthType,
    hospital: baby.hospital,
    feedingType: baby.feedingType,
    allergies: baby.allergies ?? [],
    notes: baby.notes,
    createdAt: baby.createdAt.toISOString(),
    updatedAt: baby.updatedAt.toISOString(),
  };
}

export async function GET(
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

    const baby = await Baby.findOne({ _id: id, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(serializeBaby(baby));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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
    const parsed = babySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectDB();

    const baby = await Baby.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        ...parsed.data,
        birthDate: dateOnlyToMongo(parsed.data.birthDate),
        photoUrl: parsed.data.photoUrl || undefined,
        allergies: parsed.data.allergies ?? [],
      },
      { new: true }
    );

    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(serializeBaby(baby));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const baby = await Baby.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
