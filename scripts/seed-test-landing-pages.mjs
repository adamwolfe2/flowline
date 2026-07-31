/**
 * Seeds two demo LANDING-PAGE funnels into the master admin account
 * (adamwolfe102@gmail.com), built from that account's real quiz funnels:
 *
 *   - pitch&co.          → content-led landing (brand + reels + calendar)
 *   - Superpower Mentors → video-led landing   (VSL + booking form + calendar)
 *
 * Usage:
 *   node scripts/seed-test-landing-pages.mjs --validate-only   # no DB, structural check
 *   node scripts/seed-test-landing-pages.mjs                   # inserts (needs migrated DB)
 *
 * Requires the `funnels.type` column (migration 0006). Idempotent: re-running
 * upserts by slug rather than creating duplicates.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

const VALIDATE_ONLY = process.argv.includes("--validate-only");
const ADMIN_EMAIL = "adamwolfe102@gmail.com";

// ---------------------------------------------------------------------------
// Config builders (data pulled from the account's existing quiz funnels)
// ---------------------------------------------------------------------------

function pitchAndCoConfig() {
  const brand = {
    name: "pitch&co.",
    logoUrl:
      "https://zv5vnmhfjoib21fx.public.blob.vercel-storage.com/logos/url-gen-pitchand.co-1781561248145.png",
    primaryColor: "#111827",
    primaryColorLight: "#eff1f6",
    primaryColorDark: "#152037",
    fontHeading: "Inter",
    fontBody: "Inter",
  };
  return {
    type: "landing",
    brand,
    theme: { background: "#ffffff", maxWidth: "wide", font: "inherit-from-brand" },
    seo: {
      metaTitle: "pitch&co. — Launch Videos That Sell",
      metaDescription: "We build launch videos that boost your sales. Book a 20-minute call.",
    },
    meta: {
      title: "pitch&co. — Launch Videos That Sell",
      description: "We build launch videos that boost your sales.",
    },
    webhook: { url: "" },
    tracking: { fbPixelId: "", tiktokPixelId: "", ga4MeasurementId: "" },
    blocks: [
      {
        id: "pc-hero",
        type: "hero",
        props: {
          logoUrl: brand.logoUrl,
          headline: "Let's Build Your Company a Launch Video",
          subheadline: "Find out how Pitch&Co can boost your sales.",
          ctaLabel: "Book a 20-min Call",
          ctaTargetBlockId: "pc-booking",
        },
      },
      {
        id: "pc-text",
        type: "text",
        props: {
          heading: "Why a launch video",
          body:
            "Most companies get one shot at a first impression. A sharp launch video makes it land. **We script, shoot, and edit** the video your product deserves — then hand you an asset that keeps selling.",
        },
      },
      {
        id: "pc-reel-1",
        type: "video",
        props: {
          provider: "youtube",
          url: "https://www.youtube.com/watch?v=4GjCHUcyakU",
          autoplay: false,
          aspectRatio: "16:9",
        },
      },
      {
        id: "pc-reel-2",
        type: "video",
        props: {
          provider: "youtube",
          url: "https://www.youtube.com/watch?v=9sz_63xj97g",
          autoplay: false,
          aspectRatio: "16:9",
        },
      },
      {
        id: "pc-booking",
        type: "booking_form",
        props: {
          fields: ["name", "email"],
          submitLabel: "Book My Call",
          successMode: "show_calendar",
          successCalendarBlockId: "pc-calendar",
        },
      },
      {
        id: "pc-calendar",
        type: "calendar",
        props: { url: "https://cal.com/rob-sicat-mhburb/15min?duration=20", provider: "cal" },
      },
    ],
  };
}

function superpowerMentorsConfig() {
  const brand = {
    name: "Superpower Mentors",
    logoUrl:
      "https://zv5vnmhfjoib21fx.public.blob.vercel-storage.com/logos/user_3B44ImzxwilWiXcChhQP2ijSSRn-1774291035406.jpeg",
    primaryColor: "#2563EB",
    primaryColorLight: "#e9effc",
    primaryColorDark: "#0c42b6",
    fontHeading: "Inter",
    fontBody: "Inter",
  };
  return {
    type: "landing",
    brand,
    theme: { background: "#ffffff", maxWidth: "narrow", font: "inherit-from-brand" },
    seo: {
      metaTitle: "Superpower Mentors — 1-on-1 Mentorship",
      metaDescription: "Find out if your child qualifies for 1-on-1 mentorship. Watch the video and book a call.",
    },
    meta: {
      title: "Superpower Mentors — 1-on-1 Mentorship",
      description: "Find out if your child qualifies for 1-on-1 mentorship.",
    },
    webhook: { url: "" },
    tracking: { fbPixelId: "", tiktokPixelId: "", ga4MeasurementId: "" },
    blocks: [
      {
        id: "sm-hero",
        type: "hero",
        props: {
          logoUrl: brand.logoUrl,
          headline: "Find Out If Your Child Qualifies for 1-on-1 Mentorship",
          subheadline: "Watch the short video below, then book a time to talk.",
          ctaLabel: "Book a Call",
          ctaTargetBlockId: "sm-booking",
        },
      },
      {
        id: "sm-video",
        type: "video",
        props: {
          provider: "youtube",
          url: "https://youtu.be/1gAHCda4UME",
          autoplay: false,
          aspectRatio: "16:9",
        },
      },
      {
        id: "sm-text",
        type: "text",
        props: {
          body:
            "Superpower Mentors pairs your child with a mentor who has *actually done it*. Real guidance, real accountability, real results.",
        },
      },
      {
        id: "sm-booking",
        type: "booking_form",
        props: {
          fields: ["name", "email", "phone"],
          submitLabel: "See Available Times",
          successMode: "show_calendar",
          successCalendarBlockId: "sm-calendar",
        },
      },
      {
        id: "sm-calendar",
        type: "calendar",
        props: { url: "https://app.cal.com/adamwolfe/super-power-mentors", provider: "cal" },
      },
    ],
  };
}

const PAGES = [
  { slug: "pitch-co-landing", config: pitchAndCoConfig() },
  { slug: "superpower-mentors-landing", config: superpowerMentorsConfig() },
];

// ---------------------------------------------------------------------------
// Structural validation (mirrors src/lib/landing.ts validateLandingConfig)
// ---------------------------------------------------------------------------

const KNOWN_BLOCK_TYPES = new Set([
  "hero", "text", "video", "image", "calendar",
  "booking_form", "testimonial", "button", "divider", "spacer",
]);

function validate(config, slug) {
  const errors = [];
  if (config.type !== "landing") errors.push("type must be 'landing'");
  if (!config.brand || typeof config.brand !== "object") errors.push("missing brand");
  if (!config.theme || typeof config.theme !== "object") errors.push("missing theme");
  if (!Array.isArray(config.blocks)) errors.push("missing blocks array");

  const ids = new Set();
  for (const b of config.blocks ?? []) {
    if (!b?.id) errors.push("block with no id");
    else if (ids.has(b.id)) errors.push(`duplicate block id: ${b.id}`);
    else ids.add(b.id);
    if (!KNOWN_BLOCK_TYPES.has(b?.type)) errors.push(`unknown block type: ${b?.type}`);
  }

  // Referential integrity: every block-id reference must resolve.
  for (const b of config.blocks ?? []) {
    const refs = [];
    if (b.type === "hero" && b.props.ctaTargetBlockId) refs.push(b.props.ctaTargetBlockId);
    if (b.type === "button" && b.props.targetBlockId) refs.push(b.props.targetBlockId);
    if (b.type === "booking_form" && b.props.successCalendarBlockId) {
      refs.push(b.props.successCalendarBlockId);
      const target = config.blocks.find((x) => x.id === b.props.successCalendarBlockId);
      if (target && target.type !== "calendar") {
        errors.push(`${b.id}.successCalendarBlockId points at a non-calendar block`);
      }
    }
    for (const r of refs) {
      if (!ids.has(r)) errors.push(`${b.id} references missing block ${r}`);
    }
  }

  if (errors.length) {
    console.error(`✗ ${slug}: ${errors.join("; ")}`);
    return false;
  }
  console.log(`✓ ${slug}: valid (${config.blocks.length} blocks)`);
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let allValid = true;
  for (const p of PAGES) allValid = validate(p.config, p.slug) && allValid;
  if (!allValid) {
    console.error("Validation failed — not inserting.");
    process.exit(1);
  }
  if (VALIDATE_ONLY) {
    console.log("--validate-only: skipping DB insert.");
    return;
  }

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  // Guard: refuse to run against an un-migrated DB.
  const [{ exists }] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'funnels' AND column_name = 'type'
    ) AS exists`;
  if (!exists) {
    console.error("funnels.type does not exist — run migration 0006 first.");
    process.exit(1);
  }

  const [owner] = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`;
  if (!owner) {
    console.error(`No user with email ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  for (const p of PAGES) {
    const configJson = JSON.stringify(p.config);
    const rows = await sql`
      INSERT INTO funnels (user_id, slug, config, type, published, creation_source)
      VALUES (${owner.id}, ${p.slug}, ${configJson}::jsonb, 'landing', true, 'manual')
      ON CONFLICT (slug) DO UPDATE
        SET config = EXCLUDED.config, type = 'landing', published = true, updated_at = now()
      RETURNING id, slug`;
    console.log(`seeded ${rows[0].slug} → /f/${rows[0].slug} (id ${rows[0].id})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
