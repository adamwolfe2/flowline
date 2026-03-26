import type { Funnel as DbFunnel } from "@/db/schema";

// Re-export DB model types that need no override
export type { Lead, FunnelSession, User } from "@/db/schema";

// Funnel with properly typed config (Drizzle returns jsonb as unknown)
export type Funnel = Omit<DbFunnel, "config"> & { config: FunnelConfig };

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
    video?: {
      enabled: boolean;
      url: string;
    };
    ctaButtonText?: string;
    emailHeadline?: string;
    emailSubtext?: string;
    emailButtonText?: string;
    successHeadline?: string;
    successSubtext?: string;
    successRedirectUrl?: string;
    results?: {
      high?: { headline?: string; subtext?: string; redirectUrl?: string };
      mid?: { headline?: string; subtext?: string; redirectUrl?: string };
      low?: { headline?: string; subtext?: string; redirectUrl?: string };
    };
    badgeText?: string;
    trustBadges?: [string, string, string];
    contentBlocks?: ContentBlock[];
  };
  webhook: {
    url: string;
    format?: "default" | "ghl";
  };
  meta: {
    title: string;
    description: string;
  };
  tracking?: {
    fbPixelId?: string;
    tiktokPixelId?: string;
    ga4MeasurementId?: string;
    cursivePixelId?: string;
    customScripts?: string[];
  };
}

export interface ContentBlock {
  id: string;
  type: "testimonial" | "image" | "video" | "text";
  content: {
    // Testimonial
    quote?: string;
    author?: string;
    role?: string;
    // Image
    imageUrl?: string;
    caption?: string;
    // Video
    videoUrl?: string;
    // Text
    heading?: string;
    body?: string;
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

export interface FunnelStats {
  totalSessions: number;
  completionRate: number;
  conversionRate: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  tierBreakdown: { high: number; mid: number; low: number };
}

export type Plan = 'free' | 'pro' | 'agency';
