import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// POST generate/regenerate share link
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [funnel] = await db.select()
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const token = crypto.randomBytes(16).toString("hex");

    const [updated] = await db.update(funnels)
      .set({ shareToken: token })
      .where(eq(funnels.id, id))
      .returning();

    return NextResponse.json({ shareToken: updated.shareToken });
  } catch (error) {
    console.error("POST /api/funnels/[id]/share error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE revoke share link
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await db.update(funnels)
      .set({ shareToken: null })
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/funnels/[id]/share error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
