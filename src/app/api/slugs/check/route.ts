import { NextRequest, NextResponse } from "next/server";
import { checkSlugAvailable } from "@/db/queries/funnels";
import { checkRateLimit, ogLimiter } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { limited } = await checkRateLimit(ogLimiter, ip);
    if (limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    // Server-side slug validation
    if (slug.length < 3 || slug.length > 40) {
      return NextResponse.json({ error: "Slug must be 3-40 characters" }, { status: 400 });
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    const available = await checkSlugAvailable(slug);
    return NextResponse.json({ available, slug });
  } catch (error) {
    console.error("GET /api/slugs/check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
