import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads, funnels, events, funnelSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { leadId } = await params;

    // Get lead
    const lead = await db.select().from(leads).where(eq(leads.id, leadId));
    if (!lead[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify ownership
    const funnel = await db.select().from(funnels)
      .where(and(eq(funnels.id, lead[0].funnelId), eq(funnels.userId, userId)));
    if (!funnel[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get session events if sessionId exists
    let sessionEvents: Array<Record<string, unknown>> = [];
    if (lead[0].sessionId) {
      sessionEvents = await db.select().from(events)
        .where(eq(events.sessionId, lead[0].sessionId))
        .orderBy(events.createdAt);
    }

    // Get session info
    let session = null;
    if (lead[0].sessionId) {
      const sessions = await db.select().from(funnelSessions).where(eq(funnelSessions.id, lead[0].sessionId));
      session = sessions[0] || null;
    }

    return NextResponse.json({
      lead: lead[0],
      funnel: { name: (funnel[0].config as Record<string, Record<string, string>>)?.brand?.name, slug: funnel[0].slug },
      session,
      events: sessionEvents,
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
