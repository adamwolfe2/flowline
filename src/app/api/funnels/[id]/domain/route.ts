import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { addDomainToVercel, removeDomainFromVercel, getDomainStatus, isVercelConfigured } from "@/lib/vercel-domains";
import { isSuperAdmin } from "@/lib/admin";
import { getPlanLimits } from "@/lib/plan-limits";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [funnel] = await db.select({ customDomain: funnels.customDomain, userId: funnels.userId })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));

    if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    if (!funnel.customDomain) return NextResponse.json({ verified: false, verification: [] });

    if (!isVercelConfigured()) {
      return NextResponse.json({ verified: false, verification: [], error: "Vercel not configured" });
    }

    const status = await getDomainStatus(funnel.customDomain);
    return NextResponse.json(status);
  } catch (error) {
    logger.error("Domain status check error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { domain } = await req.json();

    // Plan enforcement — custom domains require Pro or Agency
    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin && domain) {
      const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      const limits = getPlanLimits(user?.plan ?? "free");
      if (!limits.customDomains) {
        return NextResponse.json(
          { error: "Custom domains require a Pro plan. Upgrade to unlock this feature.", upgrade: true },
          { status: 403 }
        );
      }
    }

    // Validate domain format
    if (domain) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(domain)) {
        return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
      }
      if (domain.length > 255) {
        return NextResponse.json({ error: "Domain exceeds maximum length of 255 characters" }, { status: 400 });
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

    const normalizedDomain = domain ? domain.toLowerCase() : null;
    const oldDomain = funnel.customDomain;

    // Register/remove domain with Vercel
    let verification: Array<{ type: string; domain: string; value: string; reason: string }> = [];
    let verified = false;

    if (isVercelConfigured()) {
      try {
        // Remove old domain if changing
        if (oldDomain && oldDomain !== normalizedDomain) {
          await removeDomainFromVercel(oldDomain).catch(() => {});
        }

        // Add new domain
        if (normalizedDomain) {
          const vercelResult = await addDomainToVercel(normalizedDomain);
          verified = vercelResult.verified ?? false;
          verification = vercelResult.verification ?? [];
        }
      } catch (vercelError) {
        // Domain may already exist — check its status
        if (normalizedDomain) {
          try {
            const status = await getDomainStatus(normalizedDomain);
            verified = status.verified;
            verification = status.verification;
          } catch {
            // Fall through — we still save to DB
          }
        }
        logger.error("Vercel domain registration failed", {
          domain: normalizedDomain,
          error: vercelError instanceof Error ? vercelError.message : String(vercelError),
        });
      }
    }

    // Update domain in DB
    const [updated] = await db.update(funnels)
      .set({ customDomain: normalizedDomain, updatedAt: new Date() })
      .where(eq(funnels.id, id))
      .returning();

    return NextResponse.json({ ...updated, verification, verified });
  } catch (error) {
    logger.error("Domain update error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
