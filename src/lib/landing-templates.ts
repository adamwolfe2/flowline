import type { LandingBlock } from "@/types";

/**
 * Named starter templates for the landing-page funnel type.
 *
 * Each template returns a ready-to-edit set of blocks for a common
 * direct-response archetype. Consumers (the /build template gallery) layer
 * brand/theme/meta on top via `buildLandingConfig`, exactly like the AI path.
 *
 * Design rules:
 *  - Copy is generic-but-usable placeholder the user edits — never
 *    business-specific claims.
 *  - NO testimonial blocks: a template must never ship a fabricated review.
 *    Users add real customer quotes themselves.
 *  - Block ids are fixed and unique WITHIN a template (all that a config
 *    requires); cross-block references (`ctaTargetBlockId`,
 *    `successCalendarBlockId`) are wired to those ids.
 *
 * Kept free of DB/network access so it is importable from client and server.
 */

export interface LandingTemplate {
  id: string;
  /** Display name in the gallery. */
  name: string;
  /** One-line description of the archetype. */
  description: string;
  /** Short tags for the gallery card (e.g. "Video", "Booking"). */
  tags: string[];
  /** Produces the template's blocks. Pure — safe to call repeatedly. */
  buildBlocks: () => LandingBlock[];
}

// --- Live-Demo Booking ------------------------------------------------------
// A VSL / "watch us do it live" lander: badge, highlighted headline, demo
// video, benefits, and a booking form that reveals a calendar on submit.
function liveDemoBlocks(): LandingBlock[] {
  return [
    {
      id: "hero",
      type: "hero",
      props: {
        eyebrow: "For teams ready to move fast",
        headline: "Watch Us Build It Live in 15 Minutes",
        highlightText: "15 Minutes",
        subheadline:
          "See exactly how it works with your own materials, then book your own live build.",
        ctaLabel: "Book My Live Build",
        ctaTargetBlockId: "booking",
        secondaryCtaLabel: "Watch the Demo",
        secondaryCtaTargetBlockId: "demo-video",
        note: "Free 15-minute session on a live call. No commitment required.",
      },
    },
    {
      id: "demo-video",
      type: "video",
      props: { provider: "youtube", url: "", autoplay: false, aspectRatio: "16:9" },
    },
    {
      id: "reveal",
      type: "text",
      props: {
        heading: "What this reveals",
        body: "**How the process actually works** — start to finish, with no edited highlight reel.\n\n**Where the time goes** — the exact steps we run and why they matter.\n\n**Whether it fits you** — an honest read on your situation before you commit a thing.",
      },
    },
    {
      id: "booking",
      type: "booking_form",
      props: {
        fields: ["name", "email"],
        submitLabel: "Book My Live Build",
        successMode: "show_calendar",
        successCalendarBlockId: "calendar",
      },
    },
    {
      id: "calendar",
      type: "calendar",
      props: { url: "", provider: "cal" },
    },
  ];
}

// --- Book-a-Call ------------------------------------------------------------
// The simplest high-intent lander: pitch + booking form + calendar.
function bookACallBlocks(): LandingBlock[] {
  return [
    {
      id: "hero",
      type: "hero",
      props: {
        headline: "Book a Call With Our Team",
        subheadline: "Tell us what you need and grab a time that works for you.",
        ctaLabel: "Book My Call",
        ctaTargetBlockId: "booking",
      },
    },
    {
      id: "value",
      type: "text",
      props: {
        heading: "What to expect",
        body: "A short, no-pressure conversation about where you are now and where you want to be. If we can help, we'll tell you how. If we can't, we'll point you in the right direction.",
      },
    },
    {
      id: "booking",
      type: "booking_form",
      props: {
        fields: ["name", "email"],
        submitLabel: "Book My Call",
        successMode: "show_calendar",
        successCalendarBlockId: "calendar",
      },
    },
    {
      id: "calendar",
      type: "calendar",
      props: { url: "", provider: "cal" },
    },
  ];
}

// --- Free Training / Lead Magnet --------------------------------------------
// Email-gated free training: capture the email, deliver by message.
function leadMagnetBlocks(): LandingBlock[] {
  return [
    {
      id: "hero",
      type: "hero",
      props: {
        eyebrow: "Free training",
        headline: "The Playbook We Use, Free",
        highlightText: "Free",
        subheadline: "Enter your email to watch the full training instantly. No fluff.",
        ctaLabel: "Watch the Free Training",
        ctaTargetBlockId: "optin",
      },
    },
    {
      id: "training-video",
      type: "video",
      props: { provider: "youtube", url: "", autoplay: false, aspectRatio: "16:9" },
    },
    {
      id: "learn",
      type: "text",
      props: {
        heading: "What you'll learn",
        body: "**The core method** and why it works.\n\n**The common mistakes** that quietly cost you results.\n\n**A simple next step** you can apply the same day.",
      },
    },
    {
      id: "optin",
      type: "booking_form",
      props: {
        fields: ["email"],
        submitLabel: "Send Me the Training",
        successMode: "message",
        successMessage: "You're in. Check your inbox for the training link.",
      },
    },
  ];
}

// --- Webinar Registration ---------------------------------------------------
// Live event registration: agenda + register-by-message form.
function webinarBlocks(): LandingBlock[] {
  return [
    {
      id: "hero",
      type: "hero",
      props: {
        eyebrow: "Live masterclass",
        headline: "Save Your Seat for the Live Masterclass",
        highlightText: "Live",
        subheadline: "Join us live and learn the exact method, step by step. Seats are limited.",
        ctaLabel: "Reserve My Seat",
        ctaTargetBlockId: "register",
        note: "Can't make it live? Register anyway and we'll send you the replay.",
      },
    },
    {
      id: "agenda",
      type: "text",
      props: {
        heading: "What we'll cover",
        body: "**The framework** end to end, with real examples.\n\n**Live Q&A** so you leave with your specific questions answered.\n\n**A clear action plan** to put it to work right away.",
      },
    },
    {
      id: "register",
      type: "booking_form",
      props: {
        fields: ["name", "email"],
        submitLabel: "Reserve My Seat",
        successMode: "message",
        successMessage: "You're registered. Check your inbox for the details and calendar invite.",
      },
    },
  ];
}

export const LANDING_TEMPLATES: readonly LandingTemplate[] = [
  {
    id: "live-demo-booking",
    name: "Live-Demo Booking",
    description: "Badge headline, demo video, and a booking form that reveals your calendar.",
    tags: ["Video", "Booking", "Calendar"],
    buildBlocks: liveDemoBlocks,
  },
  {
    id: "book-a-call",
    name: "Book a Call",
    description: "A clean, high-intent page: short pitch, booking form, and calendar.",
    tags: ["Booking", "Calendar"],
    buildBlocks: bookACallBlocks,
  },
  {
    id: "lead-magnet",
    name: "Free Training",
    description: "Email-gated free training or lead magnet with an instant email capture.",
    tags: ["Video", "Email capture"],
    buildBlocks: leadMagnetBlocks,
  },
  {
    id: "webinar-registration",
    name: "Webinar Registration",
    description: "Register attendees for a live event with an agenda and confirmation message.",
    tags: ["Event", "Registration"],
    buildBlocks: webinarBlocks,
  },
] as const;

/** Looks up a template by id. Returns undefined for an unknown id. */
export function getLandingTemplate(id: string): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((t) => t.id === id);
}
