# MyVSL — Project Context for AI IDEs

## Quick Start
```bash
git clone https://github.com/adamwolfe2/flowline.git
cd flowline
npm install
cp .env.example .env.local  # Fill in all values
npm run dev
```

## What This Is
MyVSL is a no-code VSL funnel builder. Users describe their business, AI asks clarifying questions, then generates a funnel. Live at getmyvsl.com.

There are **two funnel types**, discriminated by the `funnels.type` column (`'quiz' | 'landing'`, default `'quiz'`):
- **quiz** — the original multi-step qualification quiz → lead scoring → tier-based calendar routing (Best/Good/Intro).
- **landing** — a single drag-and-drop landing page (hero, video, calendar, booking form, etc.). No steps, no scoring, single calendar. Added 2026-07-15.

Both share the SAME `funnels` object, tracking links, custom domains, embed, webhooks, billing, and the leads pipeline. The `config` JSONB is polymorphic on `type`.

### Funnel type architecture (READ before touching config)
- `funnels.type` (NOT NULL, default `'quiz'`) is the **source of truth**. `config.type` mirrors it but is absent on legacy rows — narrow on the COLUMN.
- `FunnelConfig` (in `src/types/index.ts`) is the QUIZ shape and is unchanged. `LandingConfig` is a sibling type. `AnyFunnelConfig = FunnelConfig | LandingConfig`; narrow with `isLandingConfig()` / the column. This avoids widening ~155 `config.quiz.*` derefs.
- All three public renderers (`/f/[slug]`, `/f/domain/[hostname]`, `/f/preview/[funnelId]`) dispatch through ONE choke point: `src/components/funnel/FunnelSurface.tsx`. Add rendering branches THERE, not in three places.
- `leads.score` and `leads.calendar_tier` are NULLABLE — NULL means a landing lead (not scored, not tier-routed). Every reader must handle null (sequences cron, GHL sync, lead-notification email, analytics all do).
- Landing analytics: `src/db/queries/analytics-landing.ts`; the dashboard gates quiz-only panels on `funnelType === 'landing'`.

### Landing config schema (`config` when `type='landing'`)
```jsonc
{
  "type": "landing",
  "seo": { "metaTitle": "…", "metaDescription": "…" },
  "theme": { "background": "#ffffff", "maxWidth": "narrow|wide", "font": "inherit-from-brand" },
  "blocks": [ { "id": "uuid", "type": "<block type>", "props": { … } } ]
  // brand, webhook, meta, tracking, engagementTriggers are SHARED (same shape as quiz config)
}
```
Block types + `props` contracts (full interfaces in `src/types/index.ts`):
- `hero` — `{ logoUrl?, headline, subheadline?, ctaLabel?, ctaTargetBlockId? }` (CTA scrolls to a block id)
- `text` — `{ heading?, body }` (markdown; sanitized via a safe AST renderer, NOT dangerouslySetInnerHTML)
- `video` — `{ provider: youtube|vimeo|loom|vidalytics, url, autoplay, aspectRatio: '16:9' }`
- `image` — `{ url, alt, link? }`
- `calendar` — `{ url, provider: cal|calendly|other }` (single calendar, Cal.com JS embed / iframe; no tier routing)
- `booking_form` — `{ fields: [name|email|phone], submitLabel, successMode: show_calendar|message|redirect, successCalendarBlockId?|successMessage?|redirectUrl? }`
- `testimonial` — `{ quote, author, role?, avatarUrl? }`
- `button` — `{ label, action: scroll|link, targetBlockId?|url? }`
- `divider` / `spacer` — `{ size: sm|md|lg }`

Key files: renderer `src/components/landing/`, builder `src/components/builder/landing/` (dnd-kit sortable), AI path `src/app/api/ai/generate-landing`, submit branch `src/app/api/submit/[funnelId]/route.ts`, defaults `src/lib/landing-defaults.ts`, helpers `src/lib/landing.ts`.
Block-id references (`ctaTargetBlockId`, `targetBlockId`, `successCalendarBlockId`) are auto-sanitized on any block delete/reorder in the builder.

## Tech Stack
- **Framework**: Next.js 16.1.7 (Turbopack), React 19, TypeScript strict
- **Database**: Drizzle ORM + Neon Postgres (15 tables, 10+ indexes)
- **Auth**: Clerk (middleware-protected routes)
- **Payments**: Stripe (checkout, webhooks, plan enforcement)
- **Email**: Resend (lead notifications, welcome emails, sequences via cron)
- **Storage**: Vercel Blob (uploads via `/api/upload/asset` — `kind: 'logo'|'image'`; `/api/upload/logo` is a legacy delegate)
- **Rate limiting**: Upstash Redis with in-memory fallback
- **Monitoring**: Sentry (error tracking + structured logger)
- **AI**: OpenAI GPT-4o (funnel planning + generation)
- **UI**: Tailwind v4, Framer Motion, shadcn/ui (@base-ui/react), recharts, sonner

## Architecture
```
src/
  app/
    api/          # 39 API routes
    (pages)/      # 20 pages
  components/
    marketing/    # Homepage sections (Instrument Sans/Serif fonts)
    builder/      # Funnel editor tabs
    funnel/       # Public funnel rendering (quiz steps)
    analytics/    # Charts and modals
    dashboard/    # Cards, empty state, templates
    settings/     # Team management
    ui/           # shadcn components
    AppNav.tsx    # Shared app navigation (Dashboard, Leads, Settings, Billing, Admin)
    ErrorBoundary.tsx
  db/
    schema.ts     # All 15 tables with Drizzle
    queries/      # analytics, funnels, leads, sessions, variants
    index.ts      # Neon connection
  lib/
    admin.ts      # Super admin check (hardcoded email + user ID)
    rate-limit.ts # Upstash + memory fallback
    scoring.ts    # Quiz scoring + tier assignment
    webhook.ts    # Fire webhooks with retry + delivery logging
    logger.ts     # Structured logging + Sentry
    ...
  types/index.ts  # FunnelConfig, QuizQuestion, etc.
```

## Key Patterns
- **NO emojis** — use Lucide React icons
- **NO dark mode** — light theme only, everywhere
- **Fonts**: Instrument Sans (body, marketing), Instrument Serif (headings, marketing), Inter (app pages)
- **Brand color**: `#0A9AFF` (sky blue, hover `#0883DB`) — redesigned 2026-07-03; ink `#0A0A0A`, paper `#FAFAF8`. Forest green is dead.
- **Border color**: `#E5E7EB` everywhere
- **Error logging**: `logger.error()` from `@/lib/logger` — never raw `console.error`
- **Auth**: `auth()` from Clerk on every protected route, ownership verified via userId join
- **Admin**: `isSuperAdmin(userId)` from `@/lib/admin` — checks hardcoded user ID, env var, then DB email
- **Rate limiting**: Import limiters from `@/lib/rate-limit`, call `checkRateLimit(limiter, identifier)`

## Super Admin
- Email: adamwolfe102@gmail.com
- User ID: user_3BDXaPSL6jBfBefM44mC1PldhHz
- Hardcoded in `src/lib/admin.ts` — bypasses all plan limits, gets agency plan, sees Admin nav link

## Database Tables
users, funnels, leads, funnel_sessions, events, funnel_variants, variant_assignments, email_sequences, email_steps, sequence_enrollments, teams, team_members, team_invites, webhook_deliveries

## Environment Variables Required
DATABASE_URL, CLERK keys (4), BLOB_READ_WRITE_TOKEN, NEXT_PUBLIC_PLATFORM_DOMAIN, NEXT_PUBLIC_APP_URL, OPENAI_API_KEY, UPSTASH_REDIS_REST_URL/TOKEN, STRIPE keys (6), RESEND_API_KEY, SENTRY_DSN, CRON_SECRET, VERCEL_TOKEN/PROJECT_ID/TEAM_ID, ADMIN_USER_ID

## Vercel
- Team: am-collective (team_jNDVLuWxahtHSJVrGdHLOorp)
- Project: flowline (prj_uHKjoISx4HVxRdSSVQUwnxPAzopj)
- Domains: getmyvsl.com, www.getmyvsl.com
- Cron: /api/cron/sequences every 15 min (requires CRON_SECRET)

## What Was Built in the Last Session (Mar 19-21, 2026)
1. Post-audit hardening (security, perf, data integrity) — 25 files
2. Overnight hardening pass (error handling, logging, validation)
3. Instrument Sans + Serif font system across marketing
4. Conversational AI builder (5-phase: prompt → plan → questions → generate → preview)
5. 6 enhancements (localStorage handoff, mobile preview, empty states, DNS flow, webhook log, social proof)
6. 7 critical fixes (webhook URL input, email placeholders, upgrade prompts, hero image compression)
7. Unified onboarding → /build redirect
8. Security audit (18 vulnerabilities found, 12 fixed)
9. Shared AppNav component (replaced 4 duplicate navs)
10. Dead code cleanup (13 files, 712 lines removed)
11. Super admin system (hardcoded email, plan bypass, enhanced admin dashboard)
12. Performance optimization (fonts, lazy loading, caching, image optimization)
13. E2E API testing (25 endpoints, 3 bugs fixed)
14. Mobile optimization for 375px (10 components, all grids stack)

## What Was Done in QA Pass (Mar 21, 2026)
1. Webhook HMAC signing — outgoing webhooks now include X-Webhook-Signature and X-Webhook-Timestamp headers when WEBHOOK_SIGNING_SECRET is set
2. Share token expiry — share tokens now expire after 30 days, enforced in the shared analytics API
3. SQL injection fix — leads search now escapes LIKE special characters (%_\)
4. Rate limiting added to /api/og/funnel/[funnelId] (was missing)
5. Admin domains POST no longer leaks raw error messages to client
6. Added WEBHOOK_SIGNING_SECRET to .env.example
7. Schema updated with shareTokenExpiresAt column (run `npx drizzle-kit push` to apply)

## Webhooks / Attribution (verified 2026-07-04)
- Events: `lead`, `completed`, `booking` (all carry `session_id`) + `raw` step stream (explicit opt-in, default OFF, never GHL format)
- Outgoing: HMAC-signed (`X-Webhook-Signature` + `X-Webhook-Timestamp`, `WEBHOOK_SIGNING_SECRET` set in Vercel prod 2026-07-04) + optional per-funnel `Authorization: Bearer` (`webhook.authToken` in funnel config)
- Deliveries logged in `webhook_deliveries` · per-funnel config via `/api/funnels/[id]/webhooks` · SSRF-guarded
- Downstream consumer: send.amcollectivecapital.com (AM Collective attribution — stitches raw events → submit → booking via `session_id`)

## Verified Working (2026-07-04 — do NOT re-fix)
- Stripe checkout: all 4 `STRIPE_*_PRICE_ID` envs set in Vercel (100+ days), price IDs validated live+active, amounts match billing page ($49/$468 Pro, $149/$1428 Agency)
- Test suite: vitest, 32 tests (`npx vitest run`) · eslint configured (since 2026-06-25)
- `share_token_expires_at` column confirmed present in Neon prod

## What Still Needs Work
- Builder editor unusable on mobile (<640px) — needs dedicated mobile redesign
- send.amcollectivecapital.com E2E: share WEBHOOK_SIGNING_SECRET with receiver, point funnel webhooks at its ingest endpoint, verify deliveries
