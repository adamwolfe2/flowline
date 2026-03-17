import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFunnelsByUser, createFunnel, getFunnelCount, checkSlugAvailable } from "@/db/queries/funnels";
import { getSessionStats } from "@/db/queries/sessions";
import { getLeadsThisWeek, getLeadsThisMonth, getTierBreakdown } from "@/db/queries/leads";
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

    const userFunnels = await getFunnelsByUser(userId);

    const funnelsWithStats = await Promise.all(
      userFunnels.map(async (f) => {
        const stats = await getSessionStats(f.id);
        const leadsWeek = await getLeadsThisWeek(f.id);
        const leadsMonth = await getLeadsThisMonth(f.id);
        const tierData = await getTierBreakdown(f.id);

        const tierBreakdown = { high: 0, mid: 0, low: 0 };
        tierData.forEach((t) => {
          tierBreakdown[t.tier as keyof typeof tierBreakdown] = Number(t.count);
        });

        return {
          ...f,
          stats: {
            totalSessions: stats.total,
            completionRate: stats.completionRate,
            conversionRate: stats.conversionRate,
            leadsThisWeek: leadsWeek,
            leadsThisMonth: leadsMonth,
            tierBreakdown,
          },
        };
      })
    );

    return NextResponse.json(funnelsWithStats);
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
      await db.insert(users).values({ id: userId, email: "unknown@flowline.app" }).onConflictDoNothing();
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

    let slug = rawSlug || generateSlug(config?.brand?.name || "my-funnel");

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
