import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getDashboardStats } from "@/lib/data/dashboard-stats";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get("babyId");
    if (!babyId) {
      return NextResponse.json({ error: "babyId required" }, { status: 400 });
    }

    const stats = await getDashboardStats(babyId, session.user.id);
    if (!stats) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
