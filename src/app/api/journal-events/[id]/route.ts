import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAuthUserId } from "@/lib/auth/session-user";
import { connectDB } from "@/lib/db/mongodb";
import { deleteJournalEventNotifications } from "@/lib/notifications/sync-journal-event";
import { JournalEvent } from "@/models/JournalEvent";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = getAuthUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deleted = await JournalEvent.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteJournalEventNotifications(userId, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/journal-events/[id]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
