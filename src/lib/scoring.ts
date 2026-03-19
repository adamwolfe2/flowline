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
  // Defensive: if thresholds are inverted (high < mid), swap them
  const high = Math.max(thresholds.high, thresholds.mid);
  const mid = Math.min(thresholds.high, thresholds.mid);
  if (score >= high) return 'high';
  if (score >= mid) return 'mid';
  return 'low';
}

export function getCalendarUrl(config: FunnelConfig, answers: Record<string, string>): string {
  const tier = getCalendarTier(config, answers);
  return config.quiz.calendars[tier];
}
