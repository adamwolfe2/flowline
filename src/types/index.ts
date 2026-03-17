export interface FunnelConfig {
  brand: {
    name: string;
    logoUrl: string;
    primaryColor: string;
    primaryColorLight: string;
    primaryColorDark: string;
    fontHeading: string;
    fontBody: string;
  };
  quiz: {
    headline: string;
    subheadline: string;
    questions: QuizQuestion[];
    thresholds: { high: number; mid: number };
    calendars: { high: string; mid: string; low: string };
    calEmbed?: {
      namespace: string;
      calLink: string;
      brandColor: string;
    };
  };
  webhook: {
    url: string;
  };
  meta: {
    title: string;
    description: string;
  };
}

export interface QuizQuestion {
  key: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  label: string;
  points: number;
}

export interface Funnel {
  id: string;
  user_id: string;
  slug: string;
  custom_domain: string | null;
  config: FunnelConfig;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  funnel_id: string;
  email: string;
  answers: Record<string, string>;
  score: number;
  calendar_tier: 'high' | 'mid' | 'low';
  created_at: string;
}

export interface FunnelSession {
  id: string;
  funnel_id: string;
  started_at: string;
  completed: boolean;
  converted: boolean;
}

export interface FunnelStats {
  totalSessions: number;
  completionRate: number;
  conversionRate: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  tierBreakdown: { high: number; mid: number; low: number };
}

export type Plan = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: Plan;
  created_at: string;
}
