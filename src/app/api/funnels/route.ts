import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFunnelsWithStats, createFunnel, getFunnelCount, checkSlugAvailable } from "@/db/queries/funnels";
import { DEFAULT_FUNNEL_CONFIG } from "@/lib/default-config";
import { generateSlug } from "@/lib/utils";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const funnelsWithStats = await getFunnelsWithStats(userId);

    return NextResponse.json(funnelsWithStats, {
      headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" }
    });
  } catch (error) {
    console.error("GET /api/funnels error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure user exists in DB
    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      await db.insert(users).values({ id: userId, email: "unknown@getmyvsl.com" }).onConflictDoNothing();
    }

    // Free plan check
    const count = await getFunnelCount(userId);
    const userRow = existingUser[0];
    const plan = userRow?.plan ?? "free";
    if (plan === "free" && count >= 1) {
      return NextResponse.json({ error: "Free plan limited to 1 funnel. Upgrade to Pro." }, { status: 403 });
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
    console.error("POST /api/funnels error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
