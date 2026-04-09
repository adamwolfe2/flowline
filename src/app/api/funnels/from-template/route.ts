import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { logger } from "@/lib/logger";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { FUNNEL_TEMPLATES, type TemplateId } from "@/lib/funnel-templates";

const schema = z.object({
  templateId: z.string().min(1),
  businessName: z.string().min(2).max(100),
  tagline: z.string().min(5).max(200),
  industry: z.string().min(2).max(100),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

function buildSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = Date.now().toString(36);
  return `${base}-${suffix}`;
}

function deriveLightColor(hex: string): string {
  return hex + "1A";
}

function deriveDarkColor(hex: string): string {
  // Darken by roughly 15% — keep it simple for template generation
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: reuse aiLimiter (5 per day per user)
    const rl = await checkRateLimit(aiLimiter, `template:${userId}`);
    if (rl.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { templateId, businessName, tagline, primaryColor } = parsed.data;

    const template = FUNNEL_TEMPLATES[templateId as TemplateId];
    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateId}" not found.` },
        { status: 400 }
      );
    }

    const color = primaryColor ?? template.brand.primaryColor;

    const config = {
      ...template,
      brand: {
        ...template.brand,
        name: businessName,
        primaryColor: color,
        primaryColorLight: deriveLightColor(color),
        primaryColorDark: deriveDarkColor(color),
      },
      quiz: {
        ...template.quiz,
        headline: `${template.quiz.headline.replace("Your Business", businessName)}`,
      },
      meta: {
        title: `${businessName} — ${tagline}`,
        description: tagline,
      },
    };

    const slug = buildSlug(businessName);

    const result = await db
      .insert(funnels)
      .values({
        userId,
        slug,
        config,
        published: false,
        creationSource: 'template' as const,
      })
      .returning({ id: funnels.id, slug: funnels.slug });

    const row = result[0];
    if (!row) {
      throw new Error("Insert returned no rows");
    }

    return NextResponse.json({ funnelId: row.id, slug: row.slug }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/funnels/from-template error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
