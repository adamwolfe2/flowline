import { NextRequest, NextResponse } from "next/server";
import { insertSession, completeSession, convertSession } from "@/db/queries/sessions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { funnelId } = await params;
    const body = await req.json();
    const { event, sessionId } = body;

    if (event === "start") {
      const session = await insertSession(funnelId);
      return NextResponse.json({ sessionId: session.id });
    }

    if (event === "complete" && sessionId) {
      await completeSession(sessionId);
      await convertSession(sessionId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
