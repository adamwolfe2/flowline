import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a VSL funnel copywriter and conversion strategist.
Given a business description, generate a complete lead qualification quiz funnel.

Return ONLY valid JSON matching this exact schema:
{
  "headline": "string — compelling, outcome-focused, max 12 words",
  "subheadline": "string — clarifies who this is for, max 20 words",
  "brandName": "string — extracted or inferred business name",
  "questions": [
    {
      "key": "q1",
      "text": "string — qualification question",
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

Questions must qualify: budget/revenue, timeline/urgency, and problem-awareness/sophistication. Points 0-3 per option. Do not include calendar URLs, colors, or logo. Return JSON only — no markdown, no backticks.`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

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
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // Fall through to mock
    }
  }

  // Mock response for development
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
