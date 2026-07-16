import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getOwnedBaby } from "@/lib/api/baby-access";
import { connectDB } from "@/lib/db/mongodb";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { GalleryPhoto } from "@/models/GalleryPhoto";

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
    const existing = await GalleryPhoto.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await getOwnedBaby(existing.babyId.toString(), session.user.id);
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.cloudinaryPublicId) {
      await deleteCloudinaryImage(existing.cloudinaryPublicId);
    }

    await GalleryPhoto.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/gallery-photos/[id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
