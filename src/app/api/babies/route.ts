import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getUserBabies } from "@/lib/data/babies";
import { connectDB } from "@/lib/db/mongodb";
import { babySchema } from "@/lib/validations/baby";
import { serializeBaby } from "@/lib/data/serialize-baby";
import { Baby } from "@/models/Baby";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const babies = await getUserBabies(session.user.id);
    return NextResponse.json(babies);
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
    const parsed = babySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const baby = await Baby.create({
      userId: session.user.id,
      ...parsed.data,
      birthDate: new Date(parsed.data.birthDate),
      photoUrl: parsed.data.photoUrl || undefined,
      allergies: parsed.data.allergies ?? [],
    });

    return NextResponse.json(serializeBaby(baby), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
