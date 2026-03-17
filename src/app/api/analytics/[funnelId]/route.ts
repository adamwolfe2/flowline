import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFullAnalytics } from "@/db/queries/analytics";
import { getFunnelById } from "@/db/queries/funnels";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { funnelId } = await params;

    const funnel = await getFunnelById(funnelId, userId);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const analytics = await getFullAnalytics(funnelId);
    return NextResponse.json({ funnel, ...analytics });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
