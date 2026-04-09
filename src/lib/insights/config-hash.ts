import { createHash } from 'crypto';
import type { FunnelConfig } from '@/types';

// Hash only the fields that affect analysis semantics. Logo URL changes
// shouldn't invalidate insights; question text changes should.
export function hashFunnelConfig(config: FunnelConfig, timeRange: string): string {
  const semantic = {
    questions: config.quiz?.questions?.map(q => ({
      key: q.key,
      text: q.text,
      options: q.options?.map(o => ({ id: o.id, label: o.label, points: o.points })),
    })) ?? [],
    thresholds: config.quiz?.thresholds,
    hasVideo: config.quiz?.video?.enabled ?? false,
    headline: config.quiz?.headline,
    timeRange,
  };
  return createHash('sha256').update(JSON.stringify(semantic)).digest('hex').slice(0, 16);
}
