import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { deleteCloudinaryImage, isCloudinaryConfigured, uploadGalleryImage } from "@/lib/cloudinary";
import { ensureGalleryPhotoIndexes } from "@/lib/db/gallery-indexes";
import { GALLERY_MAX_PHOTOS_PER_SLOT } from "@/constants/gallery";
import { galleryPhotoUploadSchema } from "@/lib/validations/modules";
import { GalleryPhoto } from "@/models/GalleryPhoto";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_FILE_BYTES = 12 * 1024 * 1024;

function serialize(p: {
  _id: { toString(): string };
  babyId: { toString(): string };
  ageMonths: number;
  photoUrl: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: p._id.toString(),
    babyId: p.babyId.toString(),
    ageMonths: p.ageMonths,
    photoUrl: p.photoUrl,
    cloudinaryPublicId: p.cloudinaryPublicId,
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
    await ensureGalleryPhotoIndexes();
    const photos = await GalleryPhoto.find({ babyId })
      .sort({ ageMonths: 1, createdAt: 1 })
      .lean();
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

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const babyId = String(formData.get("babyId") ?? "");
    const ageMonths = Number(formData.get("ageMonths"));

    const parsed = galleryPhotoUploadSchema.safeParse({ babyId, ageMonths });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const baby = await getOwnedBaby(parsed.data.babyId, session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    await ensureGalleryPhotoIndexes();
    const existingCount = await GalleryPhoto.countDocuments({
      babyId: parsed.data.babyId,
      ageMonths: parsed.data.ageMonths,
    });

    if (existingCount >= GALLERY_MAX_PHOTOS_PER_SLOT) {
      return NextResponse.json({ error: "maxPhotosReached" }, { status: 409 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `babyido/gallery/${parsed.data.babyId}/${parsed.data.ageMonths}`;
    const { url, publicId } = await uploadGalleryImage(buffer, folder);

    const photo = await GalleryPhoto.create({
      babyId: parsed.data.babyId,
      ageMonths: parsed.data.ageMonths,
      photoUrl: url,
      cloudinaryPublicId: publicId,
    });

    return NextResponse.json(serialize(photo), { status: 201 });
  } catch (error) {
    const isDuplicate =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000;

    if (isDuplicate) {
      try {
        await ensureGalleryPhotoIndexes();
      } catch {
        /* ignore */
      }
      console.error("POST /api/gallery-photos duplicate key — legacy index", error);
      return NextResponse.json({ error: "legacyIndex" }, { status: 409 });
    }

    console.error("POST /api/gallery-photos", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
