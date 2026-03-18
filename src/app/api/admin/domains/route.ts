import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { listProjectDomains, addDomainToVercel, removeDomainFromVercel, verifyDomain, getDomainConfig, isVercelConfigured } from "@/lib/vercel-domains";
import { logger } from "@/lib/logger";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

// GET all custom domains + Vercel status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all funnels with custom domains
    const domainsInDb = await db.select({
      funnelId: funnels.id,
      customDomain: funnels.customDomain,
      slug: funnels.slug,
      published: funnels.published,
      userId: funnels.userId,
      config: funnels.config,
    })
      .from(funnels)
      .where(isNotNull(funnels.customDomain));

    // Get Vercel domains if configured
    let vercelDomains: string[] = [];
    if (isVercelConfigured()) {
      try {
        const result = await listProjectDomains();
        vercelDomains = (result.domains || []).map((d: { name: string }) => d.name);
      } catch {
        // Vercel API might fail
      }
    }

    const domains = domainsInDb.map((d) => {
      const config = d.config as { brand?: { name?: string } };
      return {
        funnelId: d.funnelId,
        domain: d.customDomain,
        slug: d.slug,
        published: d.published,
        userId: d.userId,
        funnelName: config?.brand?.name || "Untitled",
        registeredInVercel: vercelDomains.includes(d.customDomain || ""),
      };
    });

    return NextResponse.json({
      domains,
      vercelConfigured: isVercelConfigured(),
      totalVercelDomains: vercelDomains.length,
    });
  } catch (error) {
    logger.error("Admin domains error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — admin action on a domain (register, remove, verify)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    if (!isVercelConfigured()) {
      return NextResponse.json({ error: "Vercel not configured" }, { status: 503 });
    }

    switch (action) {
      case "register": {
        const result = await addDomainToVercel(domain);
        return NextResponse.json({ success: true, result });
      }
      case "remove": {
        const result = await removeDomainFromVercel(domain);
        return NextResponse.json({ success: true, result });
      }
      case "verify": {
        const result = await verifyDomain(domain);
        return NextResponse.json({ success: true, result });
      }
      case "check": {
        const config = await getDomainConfig(domain);
        return NextResponse.json({ success: true, config });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Action failed",
    }, { status: 500 });
  }
}
