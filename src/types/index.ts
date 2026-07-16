import type { Funnel as DbFunnel } from "@/db/schema";

// Re-export DB model types that need no override
export type { Lead, FunnelSession, User } from "@/db/schema";

// Funnel with properly typed config (Drizzle returns jsonb as unknown).
// NOTE: `config` is typed as the QUIZ shape here on purpose. The overwhelming
// majority of the codebase is quiz-only and dereferences `config.quiz.*`
// directly; widening this to a union would break ~155 call sites for no gain.
// Polymorphic entry points (the /f/ renderers, the builder, /api/submit,
// analytics) should use `AnyFunnel` / `AnyFunnelConfig` and narrow on the
// authoritative `type` COLUMN before handing off to type-specific code.
export type Funnel = Omit<DbFunnel, "config"> & { config: FunnelConfig };

/** Funnel whose config has not yet been narrowed to a concrete type. */
export type AnyFunnel = Omit<DbFunnel, "config"> & { config: AnyFunnelConfig };

export type FunnelType = "quiz" | "landing";

/** Config fields shared by every funnel type, regardless of shape. */
export interface SharedConfig {
  brand: BrandConfig;
  webhook: WebhookConfig;
  meta: MetaConfig;
  tracking?: TrackingConfig;
  engagementTriggers?: EngagementTriggersConfig;
}

export interface BrandConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  fontHeading: string;
  fontBody: string;
}

export interface MetaConfig {
  title: string;
  description: string;
}

export interface TrackingConfig {
  fbPixelId?: string;
  tiktokPixelId?: string;
  ga4MeasurementId?: string;
  cursivePixelId?: string;
  customScripts?: string[];
}

export interface WebhookConfig {
  url: string;
  format?: "default" | "ghl";
  // Sent as Authorization: Bearer header; for endpoints that require bearer
  // auth, e.g. the AM Collective attribution webhook.
  authToken?: string;
  // Which funnel events fire the webhook. Undefined = all enabled (back-compat),
  // except `raw` which is explicit opt-in (fires only when raw === true).
  events?: {
    lead?: boolean;       // email captured / lead created
    completed?: boolean;  // reached the thank-you screen
    booking?: boolean;    // confirmed a Cal.com / Calendly booking
    raw?: boolean;        // step-level raw funnel events (default OFF)
  };
}

export interface EngagementTriggersConfig {
  exitIntent?: {
    enabled: boolean;
    headline?: string;
    subtext?: string;
    ctaText?: string;
  };
  urgency?: {
    enabled: boolean;
    deadlineMinutes?: number;
    label?: string;
  };
}

/** Either config shape. Narrow with `isLandingConfig` / the `type` column. */
export type AnyFunnelConfig = FunnelConfig | LandingConfig;

/**
 * Narrows an un-narrowed config to the landing shape.
 * Prefer narrowing on the `funnels.type` COLUMN where available — it is
 * NOT NULL and defaulted, whereas `config.type` is absent on legacy rows.
 */
export function isLandingConfig(config: AnyFunnelConfig): config is LandingConfig {
  return config.type === "landing";
}

export interface FunnelConfig {
  /**
   * Absent on every pre-landing row; treated as "quiz". The `funnels.type`
   * column is the source of truth — this only mirrors it for the builder
   * preview postMessage channel, where the column is not in scope.
   */
  type?: "quiz";
  brand: BrandConfig;
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
  webhook: WebhookConfig;
  meta: MetaConfig;
  tracking?: TrackingConfig;
  engagementTriggers?: EngagementTriggersConfig;
}

// ---------------------------------------------------------------------------
// Landing page config (funnels.type === 'landing')
// ---------------------------------------------------------------------------

/**
 * A single-page, drag-and-drop landing page. No steps, no scoring, no
 * tier-based calendar routing — a single calendar at most.
 */
export interface LandingConfig extends SharedConfig {
  type: "landing";
  seo?: { metaTitle?: string; metaDescription?: string };
  theme: LandingTheme;
  blocks: LandingBlock[];
}

export interface LandingTheme {
  background: string;
  maxWidth: "narrow" | "wide";
  /** "inherit-from-brand" defers to config.brand.fontHeading/fontBody. */
  font: "inherit-from-brand" | string;
}

export type LandingBlockType = LandingBlock["type"];

/** Discriminated on `type` so the renderer gets exhaustiveness checking. */
export type LandingBlock =
  | { id: string; type: "hero"; props: HeroProps }
  | { id: string; type: "text"; props: TextProps }
  | { id: string; type: "video"; props: VideoProps }
  | { id: string; type: "image"; props: ImageProps }
  | { id: string; type: "calendar"; props: CalendarProps }
  | { id: string; type: "booking_form"; props: BookingFormProps }
  | { id: string; type: "testimonial"; props: TestimonialProps }
  | { id: string; type: "button"; props: ButtonProps }
  | { id: string; type: "divider"; props: SpacingProps }
  | { id: string; type: "spacer"; props: SpacingProps };

export interface HeroProps {
  logoUrl?: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  /** Scrolls to another block (e.g. the booking form). */
  ctaTargetBlockId?: string;
}

export interface TextProps {
  heading?: string;
  /** Markdown. MUST be sanitized at render time. */
  body: string;
}

export type VideoProvider = "youtube" | "vimeo" | "loom" | "vidalytics";

export interface VideoProps {
  provider: VideoProvider;
  url: string;
  autoplay: boolean;
  aspectRatio: "16:9";
}

export interface ImageProps {
  url: string;
  alt: string;
  link?: string;
}

export interface CalendarProps {
  url: string;
  provider: "cal" | "calendly" | "other";
  /**
   * Lead-gate mode for this calendar.
   *  - 'none' (default, and the value assumed when absent — preserves legacy
   *    rows and every existing funnel) renders the calendar immediately.
   *  - 'blur_overlay' renders the calendar blurred behind a name/email capture
   *    modal. The visitor is captured as a landing lead via the hardened
   *    /api/submit path (null score/tier, no forging) BEFORE the calendar
   *    unlocks and becomes bookable — so the lead is captured even if they
   *    never pick a time.
   */
  gate?: "none" | "blur_overlay";
  /** Optional copy overrides for the blur_overlay capture modal. */
  gateTitle?: string;
  gateSubtitle?: string;
  gateCtaLabel?: string;
}

export type BookingFormField = "name" | "email" | "phone";

export interface BookingFormProps {
  fields: BookingFormField[];
  submitLabel: string;
  successMode: "show_calendar" | "message" | "redirect";
  /** Required when successMode === 'show_calendar'. */
  successCalendarBlockId?: string;
  /** Required when successMode === 'message'. */
  successMessage?: string;
  /** Required when successMode === 'redirect'. */
  redirectUrl?: string;
}

export interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

export interface ButtonProps {
  label: string;
  action: "scroll" | "link";
  targetBlockId?: string;
  url?: string;
}

export interface SpacingProps {
  size: "sm" | "md" | "lg";
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

export interface TeamBranding {
  logoUrl?: string;
  logoWidth?: number;
  primaryColor?: string;
  appName?: string;
  faviconUrl?: string;
}

// Popup campaign types
export interface PopupTriggerConfig {
  exitIntent: boolean;
  timeDelay: number | null; // seconds, null = disabled
  scrollDepth: number | null; // percentage 0-100, null = disabled
  idleTime: number | null; // seconds, null = disabled
}

export interface PopupTargetingConfig {
  pageUrls: string[]; // glob patterns, empty = all pages
  utmSources: string[]; // empty = all sources
  deviceTypes: string[]; // empty = all devices
  newVisitorsOnly: boolean;
}

export interface PopupSuppressionConfig {
  dismissCookieDays: number; // days to suppress after dismiss
  convertedCookieDays: number; // days to suppress after conversion
}

export interface PopupStyleConfig {
  overlayOpacity: number; // 0-1
  borderRadius: number; // px
  animation: 'fade' | 'slide_up' | 'scale';
  maxWidth: number; // px, for modal
}

export type PopupDisplayMode = 'modal' | 'slide_in' | 'full_screen';
export type PopupPosition = 'center' | 'bottom_left' | 'bottom_right';
export type PopupStatus = 'draft' | 'active' | 'paused';
export type PopupImpressionAction = 'triggered' | 'shown' | 'dismissed' | 'engaged' | 'converted';
