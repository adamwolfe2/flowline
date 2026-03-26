import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().url("Invalid URL format").max(2000),
});

const aiOutputSchema = z.object({
  brandName: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  badgeText: z.string(),
  ctaButtonText: z.string(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  questions: z
    .array(
      z.object({
        key: z.string(),
        text: z.string(),
        options: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              points: z.number(),
            })
          )
          .min(2),
      })
    )
    .min(1),
  thresholds: z.object({
    high: z.number(),
    mid: z.number(),
  }),
  metaDescription: z.string(),
  thinking: z.string(),
});

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function buildPrompt(scrapedContent: string): string {
  return `You are an expert funnel builder. Analyze this website content and create a complete quiz-to-calendar booking funnel.

Website content:
${scrapedContent}

Extract and generate:
1. Company name
2. Industry/niche
3. What they sell (products/services)
4. Target audience (who visits this site)
5. Primary brand color (pick from any hex colors in the content, or suggest one that matches the brand)
6. A compelling headline for a qualifying quiz (max 60 chars)
7. A subheadline explaining the value prop (max 120 chars)
8. Badge text (e.g., "FREE ASSESSMENT", "QUALIFICATION QUIZ")
9. CTA button text (e.g., "Take the Quiz. It Takes 60 Seconds")
10. 3 qualifying quiz questions, each with 3-4 multiple choice options and point values (0-3). Questions should help qualify leads for this specific business.
11. Score thresholds: high tier (hot leads) and mid tier cutoffs
12. A meta description for SEO

Return ONLY valid JSON matching this exact schema:
{
  "brandName": "string",
  "headline": "string, max 60 chars",
  "subheadline": "string, max 120 chars",
  "badgeText": "string, uppercase",
  "ctaButtonText": "string",
  "primaryColor": "#hex",
  "questions": [
    {
      "key": "q1",
      "text": "string",
      "options": [
        { "id": "a", "label": "string", "points": 0 },
        { "id": "b", "label": "string", "points": 1 },
        { "id": "c", "label": "string", "points": 2 },
        { "id": "d", "label": "string", "points": 3 }
      ]
    }
  ],
  "thresholds": { "high": 7, "mid": 4 },
  "metaDescription": "string",
  "thinking": "Brief analysis of the business and why you chose these questions"
}

Do not use em dashes in any generated text. Return JSON only, no markdown, no backticks.`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth().catch(() => ({ userId: null }));

    // Rate limit by userId if authenticated, by IP if not
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
    const identifier = userId || ip;
    const { limited } = await checkRateLimit(aiLimiter, identifier);
    if (limited) {
      return NextResponse.json(
        { error: "AI generation limit reached. Try again later." },
        { status: 429 }
      );
    }

    // Parse and validate URL
    const body = await req.json();
    const parsed = urlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid URL (e.g., https://example.com)" },
        { status: 400 }
      );
    }

    const { url } = parsed.data;
    const domain = extractDomain(url);
    if (!domain) {
      return NextResponse.json({ error: "Could not parse domain from URL" }, { status: 400 });
    }

    // Step 1: Scrape website via Jina Reader
    let scrapedContent = "";
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { Accept: "text/markdown" },
        signal: AbortSignal.timeout(15000),
      });
      if (!jinaRes.ok) {
        throw new Error(`Jina returned ${jinaRes.status}`);
      }
      const fullText = await jinaRes.text();
      scrapedContent = fullText.slice(0, 8000);
    } catch (error) {
      logger.error("URL-to-funnel: Jina Reader failed", {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "Could not access that website. Please check the URL and try again." },
        { status: 400 }
      );
    }

    if (scrapedContent.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough content from that website. Try a different page." },
        { status: 400 }
      );
    }

    // Step 2: Fetch logo via Brandfetch CDN
    let logoUrl = "";
    try {
      const logoRes = await fetch(`https://cdn.brandfetch.io/${domain}/w/256/h/256`, {
        signal: AbortSignal.timeout(8000),
      });
      if (logoRes.ok) {
        const contentType = logoRes.headers.get("content-type") || "image/png";
        const logoBlob = await logoRes.blob();
        if (logoBlob.size > 0 && logoBlob.size < 5 * 1024 * 1024) {
          const ext = contentType.includes("svg") ? "svg" : contentType.includes("png") ? "png" : "png";
          const { url: blobUrl } = await put(
            `logos/url-gen-${domain}-${Date.now()}.${ext}`,
            logoBlob,
            { access: "public", contentType }
          );
          logoUrl = blobUrl;
        }
      }
    } catch (error) {
      // Logo fetch is non-critical, continue without it
      logger.warn("URL-to-funnel: Logo fetch failed", {
        domain,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Step 3: Call GPT-4o
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI generation is not configured" }, { status: 503 });
    }

    let aiData;
    try {
      const prompt = buildPrompt(scrapedContent);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert funnel builder and conversion strategist. Return only valid JSON, no markdown, no backticks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        logger.error("URL-to-funnel: AI response was not valid JSON", {
          content: content?.slice(0, 300),
        });
        throw new Error("AI returned invalid JSON");
      }

      const validated = aiOutputSchema.safeParse(parsed);
      if (!validated.success) {
        logger.error("URL-to-funnel: AI response failed schema validation", {
          errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        });
        // Try to use what we got even if it doesn't fully validate
        aiData = parsed;
      } else {
        aiData = validated.data;
      }
    } catch (error) {
      logger.error("URL-to-funnel: AI generation failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "AI generation failed. Please try again." },
        { status: 500 }
      );
    }

    // Step 4: Build full FunnelConfig-compatible response
    const primaryColor = aiData.primaryColor || "#2D6A4F";
    const brandName = aiData.brandName || domain;
    const slug = brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);

    const config = {
      brand: {
        name: brandName,
        logoUrl,
        primaryColor,
        primaryColorLight: deriveLightColor(primaryColor),
        primaryColorDark: deriveDarkColor(primaryColor),
        fontHeading: "Inter",
        fontBody: "Inter",
      },
      quiz: {
        headline: aiData.headline || "See If You Qualify",
        subheadline: aiData.subheadline || "Answer a few quick questions to get started.",
        questions: aiData.questions || [],
        thresholds: aiData.thresholds || { high: 7, mid: 4 },
        calendars: { high: "", mid: "", low: "" },
        badgeText: aiData.badgeText || "FREE ASSESSMENT",
        ctaButtonText: aiData.ctaButtonText || "Take the Quiz",
      },
      webhook: { url: "" },
      meta: {
        title: `Apply | ${brandName}`,
        description: aiData.metaDescription || "",
      },
    };

    return NextResponse.json({
      config,
      logoUrl,
      slug,
      thinking: aiData.thinking || "",
      brandName,
    });
  } catch (error) {
    logger.error("URL-to-funnel: Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
