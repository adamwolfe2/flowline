import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  const { funnelId } = await params;
  const body = await req.json();
  const { event, sessionId } = body as { event: string; sessionId?: string };

  const funnel = store.getFunnel(funnelId);
  if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

  if (event === "start") {
    const id = generateId();
    store.addSession({
      id,
      funnel_id: funnelId,
      started_at: new Date().toISOString(),
      completed: false,
      converted: false,
    });
    return NextResponse.json({ sessionId: id });
  }

  if (event === "complete" && sessionId) {
    // Update session — mark as completed and converted
    const allSessions = store.getSessions(funnelId);
    const session = allSessions.find((s) => s.id === sessionId);
    if (session) {
      session.completed = true;
      session.converted = true;
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid event" }, { status: 400 });
}
