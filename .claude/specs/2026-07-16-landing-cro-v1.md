# Slice: Landing CRO v1 — conversion optimization

Date: 2026-07-16 · Status: SPEC (not started) · Tier-1 (touches lead capture + booking path)
Tools: `cro` (strategy/copy), `impeccable` (craft), `safe-feature-slice` (invariants)

## Context
Landing-page funnel type shipped (PR #5 merged to prod). Calendars embed inline,
multi-video → slider. Adam wants conversion optimizations, standardized across ALL
landing pages. Source: screenshot review of getmyvsl.com/f/pitch-co-landing.

## Three workstreams

### 1. Layout & typography — centered, semantic H1/H2
- Center content consistently (hero + section blocks), tighten vertical rhythm.
- Semantic heading hierarchy: exactly ONE `<h1>` per page (HeroBlock headline);
  section headings (TextBlock `heading`, etc.) render as `<h2>`. Audit all blocks
  for correct levels (a11y + SEO). Currently HeroBlock=h1; verify TextBlock/others.
- Files: `src/components/landing/blocks/*`, `LandingRenderer.tsx`.
- Effort: S. Lowest risk — do first.

### 2. Calendar lead-gate (blur + capture modal)  ← highest conversion lever
- Pattern: render the calendar embed **blurred** with a name/email capture modal
  overlaid. Visitor enters info → lead is captured (POST /api/submit) → calendar
  un-blurs and is bookable. Captures the lead even if they never book.
- Builds on existing `successMode: 'show_calendar'` + `LandingInteractive.revealBlock`,
  but flips the UX: form overlays the blurred calendar instead of sitting above it.
- New calendar prop (e.g. `gate: 'blur_overlay'`) OR a landing-level setting; needs
  builder form + AI/default wiring. Preserve the existing non-gated + form-above modes.
- Reuses the hardened submit path (allowlist, null score/tier, webhook). No new lead
  columns. field_focused/lead_created analytics still fire.
- Files: `CalendarBlock.tsx`, `BookingFormBlock.tsx` (or a new `CalendarGate` block),
  `LandingInteractive.tsx`, builder `forms/*`, `types/index.ts`, defaults.
- Effort: M. Tier-1 — invariant-preserving (don't forge score/tier; don't 500 after insert).

### 3. Exit-intent popup — standard across all landing pages
- Detect exit intent (mouseleave via top of viewport) BEFORE the form is submitted →
  show a "Wait — save your spot" modal with a CTA back to the form/calendar.
- Fire once per session (sessionStorage guard). Suppress after a successful submit.
- Desktop only (mouseleave); mobile has no exit-intent — optionally use back/scroll-up
  intent or skip. No emojis, no dark, brand #0A9AFF, Instrument fonts, responsive.
- Consider reusing existing popup infra: `PopupCampaignEditor` + `/api/popup/widget`
  exist for EXTERNAL-site exit popups. For the landing page itself a lighter built-in
  modal in `LandingRenderer`/`LandingInteractive` is likely cleaner — evaluate reuse.
- Should be ON by default for all landing funnels (with an off switch), per Adam.
- Files: new `ExitIntentModal.tsx` + wire into `LandingRenderer`, a landing config flag.
- Effort: M.

## Acceptance criteria
- [ ] One `<h1>`; section headings `<h2>`; content centered; passes axe a11y.
- [ ] Blurred-calendar gate: form overlays blurred calendar; submit captures lead
      then reveals; existing modes still work; no invariant regressions (tests + live).
- [ ] Exit-intent modal fires once on mouseleave pre-submit, suppressed post-submit,
      default-on, per-funnel toggle; no layout shift; mobile handled.
- [ ] tsc · vitest · build · eslint green; browser-verified at 375/768/1280.

## Guardrails
- Tier-1: reuse the audited submit path; never forge score/tier; webhook after insert
  stays fire-and-forget. safe-feature-slice on workstream 2.
- Do NOT regress the embedded-calendar fix (inline iframe fallback, no external).
- Keep the quiz funnel untouched.

## Open questions for kickoff
- Gate scope: per-calendar-block prop vs. landing-level setting? (recommend block prop)
- Exit-intent copy + offer (discount? urgency? "your spot is held"?): use `cro`.
- Reuse PopupCampaign infra for the on-page exit modal, or build standalone?
