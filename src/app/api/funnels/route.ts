import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getFunnelsByUser, getFunnelsWithStats, createFunnel, getFunnelCount, checkSlugAvailable } from "@/db/queries/funnels";
import { DEFAULT_FUNNEL_CONFIG } from "@/lib/default-config";
import { generateSlug } from "@/lib/utils";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { db } from "@/db";
import { logger } from "@/lib/logger";
import { users, funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const funnelsWithStats = await getFunnelsWithStats(userId);
      return NextResponse.json(funnelsWithStats, {
        headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" }
      });
    } catch (statsError) {
      // Stats query failed — return funnels without stats as fallback
      logger.error("getFunnelsWithStats failed, falling back to basic query", {
        error: statsError instanceof Error ? statsError.message : String(statsError),
      });
      try {
        const basicFunnels = await getFunnelsByUser(userId);
        return NextResponse.json(basicFunnels.map(f => ({ ...f, stats: null })));
      } catch (basicError) {
        // Even basic query failed — try raw SQL
        logger.error("getFunnelsByUser also failed, trying raw query", {
          error: basicError instanceof Error ? basicError.message : String(basicError),
        });
        const rawFunnels = await db.select().from(funnels).where(eq(funnels.userId, userId));
        return NextResponse.json(rawFunnels.map(f => ({ ...f, stats: null })));
      }
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("GET /api/funnels error", { error: errMsg });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure user exists in DB with real email from Clerk
    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "unknown@getmyvsl.com";
      await db.insert(users).values({ id: userId, email }).onConflictDoNothing();
    } else if (existingUser[0].email === "unknown@getmyvsl.com") {
      // Fix placeholder email if it was set before Clerk webhook ran
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        await db.update(users).set({ email }).where(eq(users.id, userId));
      }
    }

    // Free plan check — super admin bypasses all limits
    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      const count = await getFunnelCount(userId);
      const userRow = existingUser[0];
      const plan = userRow?.plan ?? "free";
      if (plan === "free" && count >= 1) {
        return NextResponse.json({ error: "Free plan limited to 1 funnel. Upgrade to Pro." }, { status: 403 });
      }
    }

    const body = await req.json();
    const { config, slug: rawSlug } = body;

    // Validate config has required sections
    if (!config?.brand || typeof config.brand !== "object") {
      return NextResponse.json({ error: "Config must include a 'brand' object" }, { status: 400 });
    }
    if (!config?.quiz || typeof config.quiz !== "object") {
      return NextResponse.json({ error: "Config must include a 'quiz' object" }, { status: 400 });
    }

    // Field length validation
    if (config.brand.name && config.brand.name.length > 100) {
      return NextResponse.json({ error: "Business name too long (max 100 chars)" }, { status: 400 });
    }
    if (config.quiz.headline && config.quiz.headline.length > 200) {
      return NextResponse.json({ error: "Headline too long (max 200 chars)" }, { status: 400 });
    }
    if (config.quiz.subheadline && config.quiz.subheadline.length > 300) {
      return NextResponse.json({ error: "Subheadline too long (max 300 chars)" }, { status: 400 });
    }
    if (config.quiz.questions && config.quiz.questions.length > 10) {
      return NextResponse.json({ error: "Too many questions (max 10)" }, { status: 400 });
    }

    // Webhook URL validation with SSRF protection
    if (config.webhook?.url) {
      try {
        const parsed = new URL(config.webhook.url);
        if (parsed.protocol !== "https:") {
          return NextResponse.json({ error: "Webhook URL must use HTTPS" }, { status: 400 });
        }
        const h = parsed.hostname;
        if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "[::1]" ||
            h === "169.254.169.254" || h.startsWith("10.") || h.startsWith("192.168.") ||
            h.startsWith("169.254.") || h.startsWith("fd") || h.startsWith("fc") ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(h)) {
          return NextResponse.json({ error: "Internal URLs are not allowed" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
      }
    }

    let slug = rawSlug || generateSlug(config?.brand?.name || "my-funnel");

    // Validate slug format
    const validSlug = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length >= 3 && slug.length <= 40;
    if (!validSlug) {
      return NextResponse.json({ error: "Slug must be 3-40 characters, lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    // Check slug availability
    const isAvailable = await checkSlugAvailable(slug);
    if (!isAvailable) {
      const suffixedSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const isSuffixAvailable = await checkSlugAvailable(suffixedSlug);
      if (!isSuffixAvailable) {
        return NextResponse.json({ error: "Slug unavailable" }, { status: 409 });
      }
      slug = suffixedSlug;
    }

    const finalConfig = {
      ...DEFAULT_FUNNEL_CONFIG,
      ...config,
      brand: {
        ...DEFAULT_FUNNEL_CONFIG.brand,
        ...(config?.brand || {}),
        primaryColorLight: config?.brand?.primaryColorLight || deriveLightColor(config?.brand?.primaryColor || "#2563EB"),
        primaryColorDark: config?.brand?.primaryColorDark || deriveDarkColor(config?.brand?.primaryColor || "#2563EB"),
      },
    };

    const funnel = await createFunnel({ userId, slug, config: finalConfig });
    return NextResponse.json(funnel, { status: 201 });
  } catch (error) {
    logger.error("POST /api/funnels error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
