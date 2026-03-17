import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { publishFunnel } from "@/db/queries/funnels";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const funnel = await publishFunnel(id, userId);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(funnel);
  } catch (error) {
    console.error("POST /api/funnels/[id]/publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
