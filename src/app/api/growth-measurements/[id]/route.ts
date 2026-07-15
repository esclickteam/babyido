import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { GrowthMeasurement } from "@/models/GrowthMeasurement";
import { Baby } from "@/models/Baby";

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

    const item = await GrowthMeasurement.findById(id).lean();
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await Baby.findOne({ _id: item.babyId, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await GrowthMeasurement.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
