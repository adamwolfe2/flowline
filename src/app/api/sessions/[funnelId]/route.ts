import { NextRequest, NextResponse } from "next/server";
import { insertSession, completeSession, convertSession, parseDeviceType } from "@/db/queries/sessions";
import { sessionLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { limited } = await checkRateLimit(sessionLimiter, ip, 60);
    if (limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { funnelId } = await params;

    if (!isValidUUID(funnelId)) {
      return NextResponse.json({ error: "Invalid funnel ID" }, { status: 400 });
    }
    const body = await req.json();
    const { event, sessionId } = body;

    if (event === "start") {
      try {
        const userAgent = req.headers.get("user-agent") ?? "";
        const deviceType = parseDeviceType(userAgent);
        const session = await insertSession(funnelId, undefined, deviceType);
        return NextResponse.json({ sessionId: session.id });
      } catch {
        // FK constraint failure = funnel doesn't exist
        return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
      }
    }

    if (event === "complete" && sessionId) {
      await completeSession(sessionId);
      await convertSession(sessionId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  } catch (error) {
    logger.error("POST /api/sessions error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
