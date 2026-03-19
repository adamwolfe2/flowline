import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const PLAN_SYSTEM_PROMPT = `You are a VSL funnel strategist. A user described their business. Analyze it and generate tailored clarifying questions so you can build a better funnel for them.

Return ONLY valid JSON matching this exact schema:
{
  "thinking": "string, 1-2 sentence analysis of what you understand about their business",
  "questions": [
    {
      "id": "business_type",
      "text": "string, conversational question about their business category",
      "type": "multiple_choice",
      "options": ["option1", "option2", "option3", "option4", "option5", "option6"]
    },
    {
      "id": "target_audience",
      "text": "string, question about who they serve",
      "type": "multiple_choice",
      "options": ["audience1", "audience2", "audience3", "audience4"]
    },
    {
      "id": "offering",
      "text": "string, question about their specific offer or program",
      "type": "text"
    }
  ]
}

Rules:
- Generate exactly 3 questions
- business_type: multiple choice with 5-6 relevant industry categories based on their description
- target_audience: multiple choice with 4-5 specific audience segments they might serve
- offering: free text asking what specifically they sell or help with
- Questions should be conversational, not formal
- Options should be specific to their business, not generic
- Do not use em dashes in any text
- Return JSON only, no markdown, no backticks`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  const identifier = userId || req.headers.get("x-forwarded-for") || "anonymous";
  const { limited } = await checkRateLimit(aiLimiter, identifier);
  if (limited) {
    return NextResponse.json({ error: "AI limit reached. Try again later." }, { status: 429 });
  }

  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt must be 1-2000 characters" }, { status: 400 });
  }

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
            { role: "system", content: PLAN_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      try {
        const parsed = JSON.parse(content);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return NextResponse.json(parsed);
        }
      } catch {
        logger.error("AI plan response was not valid JSON", { content: content?.slice(0, 200) });
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock/fallback
  logger.warn("AI plan falling back to mock response");
  return NextResponse.json({
    thinking: "Analyzing your business to create a tailored quiz funnel.",
    questions: [
      {
        id: "business_type",
        text: "What best describes your business?",
        type: "multiple_choice",
        options: ["Coaching / Consulting", "SaaS / Software", "Marketing Agency", "E-commerce", "Professional Services", "Other"],
      },
      {
        id: "target_audience",
        text: "Who is your ideal client?",
        type: "multiple_choice",
        options: ["Small business owners", "B2B companies", "Entrepreneurs & founders", "Enterprise teams"],
      },
      {
        id: "offering",
        text: "In one sentence, what do you help them achieve?",
        type: "text",
      },
    ],
  });
}
