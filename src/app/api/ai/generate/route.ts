import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { z } from "zod";

const aiOutputSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  brandName: z.string(),
  questions: z.array(z.object({
    key: z.string(),
    text: z.string(),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      points: z.number(),
    })).min(2),
  })).min(1),
  thresholds: z.object({
    high: z.number(),
    mid: z.number(),
  }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

function buildSystemPrompt(context?: { businessType?: string; targetAudience?: string; offering?: string }) {
  const base = `You are a VSL funnel copywriter and conversion strategist.`;

  const contextBlock = context?.businessType
    ? `\nYou are building a quiz funnel for a "${context.businessType}" business${context.targetAudience ? ` that serves "${context.targetAudience}"` : ""}.${context.offering ? `\nTheir offer: "${context.offering}".` : ""}\n\nGenerate copy and questions specifically tailored to this business and audience.`
    : `\nGiven a business description, generate a complete lead qualification quiz funnel.`;

  return `${base}${contextBlock}

Return ONLY valid JSON matching this exact schema:
{
  "headline": "string, compelling, outcome-focused, max 12 words",
  "subheadline": "string, clarifies who this is for, max 20 words",
  "brandName": "string, extracted or inferred business name",
  "questions": [
    {
      "key": "q1",
      "text": "string, qualification question",
      "options": [
        { "id": "a", "label": "string", "points": 0 },
        { "id": "b", "label": "string", "points": 1 },
        { "id": "c", "label": "string", "points": 2 },
        { "id": "d", "label": "string", "points": 3 }
      ]
    }
  ],
  "thresholds": { "high": 7, "mid": 4 },
  "metaTitle": "string",
  "metaDescription": "string"
}

Questions must qualify: budget/revenue, timeline/urgency, and problem-awareness/sophistication. Points 0-3 per option. Do not include calendar URLs, colors, or logo. Do not use em dashes in any generated text. Return JSON only, no markdown, no backticks.`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  // Rate limit: by userId if authenticated, by IP if not
  const identifier = userId || req.headers.get("x-forwarded-for") || "anonymous";
  const { limited } = await checkRateLimit(aiLimiter, identifier);
  if (limited) {
    return NextResponse.json({ error: "AI generation limit reached. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const { prompt, context } = body as {
    prompt: string;
    context?: { businessType?: string; targetAudience?: string; offering?: string; calendarUrl?: string; brandColor?: string };
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt must be 1-2000 characters" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(context);

  // Build a richer user message when context is available
  const userMessage = context
    ? `${prompt}\n\nAdditional context:\n- Business type: ${context.businessType || "Not specified"}\n- Target audience: ${context.targetAudience || "Not specified"}\n- Offering: ${context.offering || "Not specified"}`
    : prompt;

  // If OpenAI key is available, use it
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        logger.error("AI response was not valid JSON", { content: content?.slice(0, 200) });
        parsed = null;
      }

      if (parsed) {
        const validated = aiOutputSchema.safeParse(parsed);
        if (validated.success) {
          return NextResponse.json(validated.data);
        }
        logger.error("AI response failed schema validation", {
          errors: validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        });
        // Fall through to mock with fallback flag
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock/fallback response
  logger.warn("AI generation falling back to mock response");
  const mock = {
    headline: "Discover If You Qualify for Accelerated Growth",
    subheadline: "Answer 3 quick questions to see if we're the right fit for your business.",
    brandName: "Your Business",
    questions: [
      {
        key: "q1",
        text: "What is your current monthly revenue?",
        options: [
          { id: "a", label: "Under $10k", points: 0 },
          { id: "b", label: "$10k-$50k", points: 1 },
          { id: "c", label: "$50k-$200k", points: 2 },
          { id: "d", label: "$200k+", points: 3 },
        ],
      },
      {
        key: "q2",
        text: "How urgently do you need to scale?",
        options: [
          { id: "a", label: "Just exploring", points: 0 },
          { id: "b", label: "Within 6 months", points: 1 },
          { id: "c", label: "Within 3 months", points: 2 },
          { id: "d", label: "Immediately", points: 3 },
        ],
      },
      {
        key: "q3",
        text: "What's your biggest challenge?",
        options: [
          { id: "a", label: "Not enough leads", points: 1 },
          { id: "b", label: "Low conversion rate", points: 2 },
          { id: "c", label: "Can't scale operations", points: 3 },
          { id: "d", label: "All of the above", points: 3 },
        ],
      },
    ],
    thresholds: { high: 7, mid: 4 },
    metaTitle: "Apply | Your Business",
    metaDescription: "See if you qualify for our program.",
  };

  return NextResponse.json(mock);
}
