import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/db/mongodb";
import { FeedingEntry } from "@/models/FeedingEntry";
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

    const entry = await FeedingEntry.findById(id).lean();
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const baby = await Baby.findOne({ _id: entry.babyId, userId: session.user.id });
    if (!baby) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await FeedingEntry.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
