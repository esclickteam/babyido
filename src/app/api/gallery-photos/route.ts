import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { galleryPhotoSchema } from "@/lib/validations/modules";
import { GalleryPhoto } from "@/models/GalleryPhoto";

function serialize(p: {
  _id: { toString(): string };
  babyId: { toString(): string };
  ageMonths: number;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: p._id.toString(),
    babyId: p.babyId.toString(),
    ageMonths: p.ageMonths,
    photoUrl: p.photoUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
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
    const photos = await GalleryPhoto.find({ babyId }).sort({ ageMonths: 1 }).lean();
    return NextResponse.json(photos.map(serialize));
  } catch (error) {
    console.error("GET /api/gallery-photos", error);
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
    const parsed = galleryPhotoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const baby = await getOwnedBaby(parsed.data.babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const photo = await GalleryPhoto.findOneAndUpdate(
      { babyId: parsed.data.babyId, ageMonths: parsed.data.ageMonths },
      { photoUrl: parsed.data.photoUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(serialize(photo), { status: 201 });
  } catch (error) {
    console.error("POST /api/gallery-photos", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
