import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { domain } = await req.json();

    // Validate domain format
    if (domain) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(domain)) {
        return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
      }

      const normalizedDomain = domain.toLowerCase();

      // Check domain not already taken
      const [existing] = await db.select({ id: funnels.id })
        .from(funnels)
        .where(eq(funnels.customDomain, normalizedDomain));

      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Domain already in use" }, { status: 409 });
      }
    }

    // Verify funnel ownership
    const [funnel] = await db.select()
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    // Update domain (null to remove)
    const normalizedDomain = domain ? domain.toLowerCase() : null;
    const [updated] = await db.update(funnels)
      .set({ customDomain: normalizedDomain, updatedAt: new Date() })
      .where(eq(funnels.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/funnels/[id]/domain error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
