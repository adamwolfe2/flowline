import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sendClientInviteEmail } from "@/lib/resend";

const shareBodySchema = z.object({
  clientEmail: z.string().email().optional(),
  dailyDigest: z.boolean().optional(),
  sendInvite: z.boolean().optional(),
}).optional();

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

    let body: z.infer<typeof shareBodySchema> = undefined;
    try {
      const raw = await req.json();
      body = shareBodySchema.parse(raw);
    } catch {
      // Body is optional — POST with no body just generates a token
    }

    const clientEmail = body?.clientEmail ?? funnel.shareClientEmail;
    const dailyDigest = body?.dailyDigest ?? funnel.shareDailyDigest ?? false;
    const sendInvite = body?.sendInvite ?? false;

    // Generate new token only if one doesn't exist or is expired
    const existingValid = funnel.shareToken &&
      funnel.shareTokenExpiresAt &&
      new Date() < new Date(funnel.shareTokenExpiresAt);

    const token = existingValid ? funnel.shareToken! : crypto.randomBytes(32).toString("hex");
    const expiresAt = existingValid ? funnel.shareTokenExpiresAt! : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [updated] = await db.update(funnels)
      .set({
        shareToken: token,
        shareTokenExpiresAt: expiresAt,
        shareClientEmail: clientEmail ?? null,
        shareDailyDigest: dailyDigest,
      })
      .where(eq(funnels.id, id))
      .returning();

    // Send invite email if requested
    if (sendInvite && clientEmail) {
      const config = funnel.config as { brand?: { name?: string } };
      const brandName = config.brand?.name || "Funnel";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
      const shareUrl = `${appUrl}/analytics/shared/${token}`;
      await sendClientInviteEmail({
        toEmail: clientEmail,
        brandName,
        shareUrl,
      });
    }

    return NextResponse.json({
      shareToken: updated.shareToken,
      shareTokenExpiresAt: updated.shareTokenExpiresAt,
      shareClientEmail: updated.shareClientEmail,
      shareDailyDigest: updated.shareDailyDigest,
    });
  } catch (error) {
    logger.error("POST /api/funnels/[id]/share error:", { error: error instanceof Error ? error.message : String(error) });
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
      .set({
        shareToken: null,
        shareTokenExpiresAt: null,
        shareClientEmail: null,
        shareDailyDigest: false,
      })
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/funnels/[id]/share error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
