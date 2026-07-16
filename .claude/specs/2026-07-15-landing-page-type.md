# Slice: Landing Page funnel type (getmyvsl.com / flowline)

Date: 2026-07-15 · Status: COMPLETE (all 5 slices, migrated + live in prod) · Tier-1

## Slice 5 (link/tracking/domain/embed) — added 2026-07-16
The original spec's `/r/[code]` short-link + first-touch route is FALSE — no such route,
no short-link table. Next 16 renamed middleware to `src/proxy.ts`; THAT does host routing.
Findings: every link surface was already type-agnostic EXCEPT the embed height signal.
- FIXED: landing renderer now posts `myvsl:resize` when embedded (`EmbedAutoResize.tsx`),
  else the script-embed iframe stayed pinned at 500px and clipped the page.
- Cosmetic: embed script iframe title + PublishPanel labels now type-aware (no "Quiz" on landing).
- `proxy.ts` rewrites custom domain → `/f/domain/[hostname]`, subdomain → `/f/[slug]`; both
  dispatch by `type` via FunnelSurface. API routes pass through on custom domains (landing
  submit/events work there). Tracking links = client-side UTM builder in PublishPanel (type-agnostic).
- PROVEN LIVE: same `/f/domain/[hostname]` route served a quiz (leasestack-v8y0) AND a landing
  (pitch-co-landing) by type — set/tested/reverted temp custom domains. Embed script.js + ?embed=true verified.

## Final state (2026-07-16)
- typecheck clean · 64 unit tests pass · production build compiles · lint 0 errors.
- 52 files changed (20 new). Migration `0006` generated, NOT applied to prod.
- BLOCKED on: applying migration 0006. neonctl needs interactive browser OAuth
  (stored token expired → 401 on the Neon API). Adam must `neonctl auth` (or provide
  NEON_API_KEY) so a branch can be cut, or apply straight to prod.
- Test landing pages: `scripts/seed-test-landing-pages.mjs` (pitch&co content-led,
  Superpower video-led) — both pass `--validate-only`; insert is gated on the migration.
- NOT committed / NOT pushed (awaiting Adam + migration).

## Goal
Add a second funnel type: a single-page drag-and-drop LANDING PAGE alongside the
existing multi-step quiz. Same `funnels` object, discriminated by a `type` column.

## Spec claims that were FALSE (verified against the repo, 2026-07-15)
The original brief was written against an imagined codebase. Corrected:

1. `db:push` — brief said use it. Repo uses versioned migrations (`drizzle/`, journal).
   `drizzle/0005` exists *specifically* to reconcile push-caused prod drift and warns
   push "prompts to truncate the (non-empty) teams table". → use `db:generate` + `db:migrate`.
2. "No changes to leads/events schemas required" — FALSE.
   - `leads.score` + `leads.calendar_tier` were NOT NULL; `tierEnum` has no null member.
     Brief's "no score, tier = null" was impossible. → made both nullable (Adam's call).
   - `leads.answers` NOT NULL; no name/phone columns → landing fields stored in `answers`.
   - `eventTypeEnum` is a real pgEnum → `video_played` + `booking_submitted` need ALTER TYPE.
     (`page_viewed` + `cta_clicked` already existed.)
3. `/api/submit` does not exist — it is `/api/submit/[funnelId]`, keyed on a UUID route param.
4. `@dnd-kit` was NOT installed ("already the house library" was false) → added as a new dep.
5. Builder is 639 lines (not ~391) and was ALREADY fully delegated to `src/components/builder/*`.
   It contains ZERO `config.quiz` access → a "QuizBuilder" extraction is a misnomer.
6. `/f/[slug]` is one of THREE renderers (`f/domain/[hostname]`, `f/preview/[funnelId]`).
   All three must branch or a landing page crashes on custom domain / preview.
7. `/r/[code]` does not exist. No `middleware.ts`. No first-touch cookie. AC #7 is UNBUILT.
   BUT `leads.utm_*` columns DO exist and were simply never populated by `insertLead`.
8. `config.calendars` does not exist — calendars live at `config.quiz.calendars` (tier-keyed).
   Pro is `maxFunnels: 25` (not unlimited); `aiLimiter` is 5/day for EVERYONE (no free/pro split);
   the AI flow lives at `/build` (5-phase), not `/onboarding`.

## Architecture decision (deviation from brief, flagged + accepted)
Brief said make `config.quiz` optional behind a discriminator. That breaks **155
`config.quiz.*` derefs across 11 files**.
INSTEAD: keep `FunnelConfig` quiz-shaped and UNCHANGED; add a sibling `LandingConfig`;
`AnyFunnelConfig = FunnelConfig | LandingConfig`; narrow at entry points on the
authoritative `funnels.type` COLUMN. Result: typecheck stayed green with only 4 fixes.

## Test landing pages — REAL data pulled from prod (adamwolfe102@gmail.com)
### pitch&co. (existing quiz slug `pitch-co`)
- brand.name "pitch&co." · primaryColor `#111827` · light `#eff1f6` · dark `#152037` · Inter
- logo: https://zv5vnmhfjoib21fx.public.blob.vercel-storage.com/logos/url-gen-pitchand.co-1781561248145.png
- headline "Let's Build Your Company a Launch Video" / sub "Find out how Pitch&Co can boost your sales"
- CTA "Take The 60 Second Quiz"
- calendar (Cal.com): https://cal.com/rob-sicat-mhburb/15min?duration=20
- 3 YouTube content blocks: 4GjCHUcyakU, 9sz_63xj97g, 3aQ4saj6QR0

### Superpower Mentors (existing quiz slug `superpower-mentors-tmgi`)
- brand.name "Superpower Mentors" · primaryColor `#2563EB` · light `#e9effc` · dark `#0c42b6` · Inter
- logo: https://zv5vnmhfjoib21fx.public.blob.vercel-storage.com/logos/user_3B44ImzxwilWiXcChhQP2ijSSRn-1774291035406.jpeg
- headline "Find Out If Your Child Qualifies for 1-on-1 Mentorship"
- sub "Answer 3 quick questions to see if Superpower Mentors is the right fit for your family."
- video (YouTube): https://youtu.be/1gAHCda4UME
- calendar (Cal.com): https://app.cal.com/adamwolfe/super-power-mentors

Both use Cal.com (JS embed path). For Calendly coverage, other funnels in the account
use Calendly (e.g. hiveshift, myvsldemo).

## Prod DB
`DATABASE_URL` = Neon `neondb` @ ep-broad-art-ad2bdz6b-pooler (PROD, live leads). No staging branch.
Confirmed unmigrated as of 2026-07-15 (`f.type does not exist`).
Migration `drizzle/0006_landing_page_type.sql` GENERATED but NOT APPLIED — awaiting Adam.

## Incidental bugs found (fixed in this slice)
- `from-template` route had NO plan check → free users could exceed the 1-funnel limit.
- `DEFAULT_FUNNEL_CONFIG` spread left a vestigial `quiz` on landing configs.
- `insertLead` never populated the existing `leads.utm_*` columns.
- Event-type allowlists duplicated in 2 files and drifting → now derived from the pgEnum.

## Known bugs found but NOT in scope (reported to Adam)
- Builder unmount autosave ignores `editingVariantId` → writes variant config onto control
  (`src/app/builder/[funnelId]/page.tsx:236`).
- `SuccessStep.tsx:89` `calendarUrl.includes("cal.com")` unanchored substring match.
- Builder <-> preview `postMessage` uses `'*'` target origin, no `event.origin` check.
- `ContentBlockDisplay.tsx` has a duplicated, weaker `getVideoEmbedUrl` shadowing `lib/video.ts`.
