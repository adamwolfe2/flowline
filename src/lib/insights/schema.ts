import { z } from 'zod';

export const insightPayloadSchema = z.object({
  headline: z.string().min(1).max(200),
  score: z.number().int().min(0).max(100),
  scoreLabel: z.enum(['needs_work', 'fair', 'good', 'excellent']),
  wins: z.array(z.object({
    title: z.string(),
    detail: z.string(),
    metric: z.string(),
  })).length(3),
  issues: z.array(z.object({
    title: z.string(),
    stepReference: z.string(),
    severity: z.enum(['critical', 'high', 'medium']),
    detail: z.string(),
    suggestion: z.string(),
    expectedLift: z.string(),
  })).length(3),
  benchmarkComparison: z.object({
    completionRate: z.object({
      yours: z.number(),
      benchmark: z.string(),
      status: z.enum(['above', 'at', 'below']),
    }),
    conversionRate: z.object({
      yours: z.number(),
      benchmark: z.string(),
      status: z.enum(['above', 'at', 'below']),
    }),
  }),
});

export type InsightPayload = z.infer<typeof insightPayloadSchema>;
