import type {
  LandingBlock,
  LandingBlockType,
  LandingConfig,
} from "@/types";

/**
 * Defaults for the landing-page funnel type.
 *
 * Two consumers:
 *  - the builder's block palette (`createDefaultBlock`), which needs a sane,
 *    immediately-renderable block for every one of the 10 block types
 *  - funnel creation (`DEFAULT_LANDING_CONFIG`)
 *
 * Kept free of DB/network access so it can be imported from both server routes
 * and client components.
 */

/** Stable ids for the two blocks in DEFAULT_LANDING_CONFIG. */
const DEFAULT_HERO_ID = "hero-default";
const DEFAULT_BOOKING_FORM_ID = "booking-form-default";

/**
 * Generates a block id. Ids only need to be unique within a single config, but
 * a uuid keeps them collision-free when blocks are copied between funnels.
 */
export function makeBlockId(): string {
  return crypto.randomUUID();
}

/**
 * A sensible starting block for each type, used by the builder's block palette.
 * Every block is renderable as-is: no required prop is left undefined, and the
 * URL-bearing blocks start empty so the builder can prompt for the real value.
 */
export function createDefaultBlock(type: LandingBlockType): LandingBlock {
  switch (type) {
    case "hero":
      return {
        id: makeBlockId(),
        type: "hero",
        props: {
          headline: "The headline that sells your offer",
          subheadline: "One line on who this is for and what they get.",
          ctaLabel: "Book a Call",
        },
      };
    case "text":
      return {
        id: makeBlockId(),
        type: "text",
        props: {
          heading: "Why this works",
          body: "Explain the problem your reader has, then the shift that solves it. Keep it to a few short paragraphs.",
        },
      };
    case "video":
      return {
        id: makeBlockId(),
        type: "video",
        props: {
          provider: "youtube",
          url: "",
          autoplay: false,
          aspectRatio: "16:9",
        },
      };
    case "image":
      return {
        id: makeBlockId(),
        type: "image",
        props: {
          url: "",
          alt: "",
        },
      };
    case "calendar":
      return {
        id: makeBlockId(),
        type: "calendar",
        props: {
          url: "",
          provider: "cal",
        },
      };
    case "booking_form":
      return {
        id: makeBlockId(),
        type: "booking_form",
        props: {
          fields: ["name", "email"],
          submitLabel: "Book My Call",
          successMode: "message",
          successMessage: "Thanks! Check your inbox for the details.",
        },
      };
    case "testimonial":
      return {
        id: makeBlockId(),
        type: "testimonial",
        props: {
          quote: "This is the single best investment we made all year.",
          author: "Jane Doe",
          role: "Founder, Acme",
        },
      };
    case "button":
      return {
        id: makeBlockId(),
        type: "button",
        props: {
          label: "Book a Call",
          action: "scroll",
        },
      };
    case "divider":
      return {
        id: makeBlockId(),
        type: "divider",
        props: { size: "md" },
      };
    case "spacer":
      return {
        id: makeBlockId(),
        type: "spacer",
        props: { size: "md" },
      };
    default: {
      // Exhaustiveness check: adding a block type to LandingBlock without
      // handling it here is a compile error.
      const exhaustive: never = type;
      throw new Error(`Unknown landing block type: ${String(exhaustive)}`);
    }
  }
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  type: "landing",
  brand: {
    name: "My Business",
    logoUrl: "",
    primaryColor: "#0A9AFF",
    primaryColorLight: "#E6F4FF",
    primaryColorDark: "#0883DB",
    fontHeading: "Inter",
    fontBody: "Inter",
  },
  theme: {
    background: "#ffffff",
    maxWidth: "narrow",
    font: "inherit-from-brand",
  },
  blocks: [
    {
      id: DEFAULT_HERO_ID,
      type: "hero",
      props: {
        headline: "The headline that sells your offer",
        subheadline: "One line on who this is for and what they get.",
        ctaLabel: "Book a Call",
        ctaTargetBlockId: DEFAULT_BOOKING_FORM_ID,
      },
    },
    {
      id: DEFAULT_BOOKING_FORM_ID,
      type: "booking_form",
      props: {
        fields: ["name", "email"],
        submitLabel: "Book My Call",
        successMode: "message",
        successMessage: "Thanks! Check your inbox for the details.",
      },
    },
  ],
  webhook: { url: "" },
  meta: {
    title: "My Business",
    description: "Book a call with us.",
  },
  tracking: {
    fbPixelId: "",
    tiktokPixelId: "",
    ga4MeasurementId: "",
  },
};
