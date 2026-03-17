import { FunnelConfig } from "@/types";

export function calculateScore(config: FunnelConfig, answers: Record<string, string>): number {
  return config.quiz.questions.reduce((total, q) => {
    const chosen = q.options.find((o) => o.id === answers[q.key]);
    return total + (chosen?.points ?? 0);
  }, 0);
}

export function getCalendarTier(config: FunnelConfig, answers: Record<string, string>): 'high' | 'mid' | 'low' {
  const score = calculateScore(config, answers);
  const { thresholds } = config.quiz;
  if (score >= thresholds.high) return 'high';
  if (score >= thresholds.mid) return 'mid';
  return 'low';
}

export function getCalendarUrl(config: FunnelConfig, answers: Record<string, string>): string {
  const tier = getCalendarTier(config, answers);
  return config.quiz.calendars[tier];
}
