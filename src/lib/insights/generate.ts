import { logger } from '@/lib/logger';
import { insightPayloadSchema, type InsightPayload } from './schema';
import { INSIGHTS_SYSTEM_PROMPT, buildInsightsUserMessage } from './prompt';

interface GenerateInsightsResult {
  payload: InsightPayload;
  promptTokens: number;
  completionTokens: number;
  costMillicents: number;
  model: string;
  generationMs: number;
}

export async function generateInsights(inputs: unknown): Promise<GenerateInsightsResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const startMs = Date.now();
  const model = 'gpt-4o-mini';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: INSIGHTS_SYSTEM_PROMPT },
        { role: 'user', content: buildInsightsUserMessage(inputs) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  const generationMs = Date.now() - startMs;

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown error');
    logger.error('OpenAI insights request failed', { status: response.status, error: errorText });
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const promptTokens = Number(data.usage?.prompt_tokens ?? 0);
  const completionTokens = Number(data.usage?.completion_tokens ?? 0);

  // Cost: input tokens x 15/1000 + output tokens x 60/1000 millicents
  const costMillicents = Math.round(promptTokens * (15 / 1000) + completionTokens * (60 / 1000));

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    logger.error('Insights AI response was not valid JSON', { content: content?.slice(0, 300) });
    throw new Error('AI returned invalid JSON');
  }

  const validated = insightPayloadSchema.safeParse(parsed);
  if (!validated.success) {
    logger.error('Insights AI response failed schema validation', {
      issues: JSON.stringify(validated.error.issues),
      content: content?.slice(0, 300),
    });
    throw new Error('AI response did not match expected schema');
  }

  return {
    payload: validated.data,
    promptTokens,
    completionTokens,
    costMillicents,
    model,
    generationMs,
  };
}
