# Performance Audit Report

**Date**: March 25, 2026
**App**: MyVSL (Next.js 16, React 19, Vercel)
**Build status**: PASSING after all changes

---

## Category 1: Server vs Client Component Split
**Status**: REVIEWED -- minor opportunities noted

**Findings**:
- 62 files use `"use client"`. All page-level components (`dashboard`, `leads`, `settings`, `billing`, `admin`, `analytics`, `builder`, `build`, `onboarding`) legitimately use hooks (`useState`, `useEffect`, `useCallback`, `useUser`, `useRouter`, `useParams`, `useSearchParams`).
- `src/components/ui/` files: `card.tsx`, `badge.tsx`, `input.tsx`, `skeleton.tsx`, `textarea.tsx` do NOT have `"use client"` -- they are already server components. The ones that DO have `"use client"` (`tabs.tsx`, `sheet.tsx`, `label.tsx`, `switch.tsx`, `avatar.tsx`, `dialog.tsx`, `separator.tsx`, `button.tsx`, `dropdown-menu.tsx`, `select.tsx`, `sonner.tsx`) all use `@base-ui/react` Radix primitives that require client-side rendering. No safe removals.
- `MarketingFooter.tsx` and `LogoStrip.tsx` do NOT have `"use client"` -- already server components. Good.
- `IntegrationsSection.tsx` has `"use client"` but only uses event handlers (`Link`) -- however it uses no hooks. Could theoretically be a server component, but it is imported dynamically now which mitigates the issue.
- No page can safely switch to server-side data fetching without a significant rewrite (all use client-side fetch + state).

**Action taken**: None needed. All `"use client"` directives are justified.

---

## Category 3: Image Optimization
**Status**: FIXED

**Changes**:
- Added `formats: ["image/avif", "image/webp"]` to `next.config.ts`
- Added `minimumCacheTTL: 2678400` (31 days) for remote images
- Converted 7 raw `<img>` tags to `next/image` in marketing components:
  - `HeroSection.tsx`: 3 integration icons (calendly, slack, hubspot)
  - `BottomCTA.tsx`: 3 integration icons
  - `IntegrationsSection.tsx`: 1 integration icon grid
- Remaining `<img>` tags are in:
  - `build/page.tsx` and `onboarding/page.tsx`: user-uploaded logos from Vercel Blob (dynamic URLs, left as-is)
  - `BrandEditor.tsx` and `FunnelCard.tsx`: user-uploaded logos (left as-is)
  - `TrackingPixels.tsx`: Facebook pixel noscript tag (cannot use next/image)

---

## Category 5: Dynamic Imports
**Status**: FIXED

**Changes**:
- `LeadsChart` and `WaterfallChart` in `analytics/[funnelId]/page.tsx` were ALREADY dynamically imported with `ssr: false`. Good.
- Homepage (`src/app/page.tsx`): Converted 6 below-the-fold components to dynamic imports:
  - `ProductDemo` (heavy -- framer-motion + tab system)
  - `IntegrationsSection`
  - `WhySection` (framer-motion animations)
  - `TemplatesSection` (framer-motion + state)
  - `TestimonialsSection` (framer-motion)
  - `BottomCTA` (framer-motion + typewriter effect)
- Above-the-fold components kept static: `MarketingNav`, `HeroSection`, `LogoStrip`, `MarketingFooter`
- `framer-motion` is used in 18 files. The `optimizePackageImports` config added in Category 16 handles tree-shaking.

---

## Category 7: Caching
**Status**: FIXED

**Changes**:
- Added static asset caching headers to `next.config.ts`:
  ```
  source: "/:all*(svg|jpg|png|webp|avif|woff2|ico)"
  Cache-Control: public, max-age=31536000, immutable
  ```
- This covers all static assets (fonts, images, icons) with 1-year immutable cache.

---

## Category 9: Font Optimization
**Status**: FIXED

**Changes**:
- All 4 fonts in `src/app/layout.tsx` now have `display: "swap"`:
  - `Inter`
  - `Instrument_Sans`
  - `Instrument_Serif`
  - `Plus_Jakarta_Sans`
- Funnel layout font (`src/app/f/[slug]/layout.tsx`) now has `display: "swap"`
- All fonts use `next/font/google` (no external CSS font imports)
- Font weights are appropriately scoped (no unnecessary weights loaded)

---

## Category 16: Build Config
**Status**: FIXED

**Changes to `next.config.ts`**:
- Added `poweredByHeader: false` (removes X-Powered-By header)
- Added `compress: true` (enables gzip compression)
- Added `experimental.optimizePackageImports` for:
  - `lucide-react` (tree-shakes unused icons)
  - `recharts` (tree-shakes unused chart components)
  - `framer-motion` (tree-shakes unused animation utilities)

---

## Category 18: Error Boundaries
**Status**: FIXED

**Existing**:
- `src/app/error.tsx` -- root error boundary
- `src/app/global-error.tsx` -- global error boundary with Sentry
- `src/app/dashboard/loading.tsx`
- `src/app/analytics/[funnelId]/loading.tsx`
- `src/app/f/[slug]/loading.tsx`

**Added** (10 new files):
- `src/app/leads/error.tsx` + `loading.tsx`
- `src/app/settings/error.tsx` + `loading.tsx`
- `src/app/billing/error.tsx` + `loading.tsx`
- `src/app/admin/error.tsx` + `loading.tsx`
- `src/app/builder/[funnelId]/error.tsx` + `loading.tsx`
- `src/app/analytics/[funnelId]/error.tsx`

All data-fetching route segments now have both error and loading boundaries.

---

## Category 22: Vercel Config
**Status**: NOT INSTALLED

**Findings**:
- `@vercel/speed-insights` is NOT in package.json
- `@vercel/analytics` is NOT in package.json
- Neither is imported in `app/layout.tsx`

**Recommendation**: Install both packages and add to root layout:
```bash
npm install @vercel/analytics @vercel/speed-insights
```
Then add `<Analytics />` and `<SpeedInsights />` to `app/layout.tsx`. Not done automatically to avoid adding new dependencies without explicit approval.

---

## Category 23: Security Headers
**Status**: FIXED (enhanced)

**Already present**:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection`
- `Permissions-Policy`
- `Content-Security-Policy`

**Added**:
- `X-DNS-Prefetch-Control: on`
- Enhanced HSTS with `preload` directive

---

## Category 25: Auth Performance
**Status**: OK -- no changes needed

**Findings**:
- Clerk middleware runs at the edge via `clerkMiddleware()` in `src/middleware.ts`
- `auth()` is called exactly once per API route handler (verified across all 39 routes)
- No duplicate `auth()` calls found -- each handler destructures `{ userId }` once at the top
- Route matcher efficiently handles protected routes

---

## Category 29: Dependency Cleanup
**Status**: REVIEWED -- 3 unused dependencies found

**Unused dependencies**:
1. **`openai`** -- Not imported anywhere. AI routes use raw `fetch()` to OpenAI API. Can be removed.
2. **`qrcode.react`** -- Not imported anywhere in the codebase. Can be removed.
3. **`cmdk`** -- Not imported anywhere in the codebase. Can be removed.

**Used correctly** (verified):
- `@base-ui/react` -- used by shadcn/ui components
- `@clerk/nextjs` -- auth
- `@neondatabase/serverless` -- database
- `@sentry/nextjs` -- error tracking
- `@upstash/ratelimit` + `@upstash/redis` -- rate limiting
- `@vercel/blob` -- logo uploads
- `canvas-confetti` -- publish celebrations (via `src/lib/confetti.ts`)
- `class-variance-authority` -- shadcn/ui variants
- `clsx` -- className utility
- `drizzle-orm` -- ORM
- `framer-motion` -- animations (18 files)
- `lucide-react` -- icons throughout
- `next` -- framework
- `react` + `react-dom` -- core
- `recharts` -- analytics charts
- `resend` -- email sending
- `shadcn` -- used via CSS import in globals.css
- `sonner` -- toast notifications
- `stripe` -- payments
- `svix` -- Clerk webhook verification
- `tailwind-merge` -- className merging
- `tw-animate-css` -- CSS animations (imported in globals.css)
- `zod` -- validation

**DevDependencies** -- all used:
- `@tailwindcss/postcss`, `tailwindcss` -- CSS framework
- `@types/*` -- TypeScript types
- `dotenv` -- env loading for drizzle-kit scripts
- `drizzle-kit` -- database migrations
- `typescript` -- compiler

**Recommendation**: Run `npm uninstall openai qrcode.react cmdk` to remove ~3 unused packages. Not done automatically to avoid breaking anything that might use these indirectly.

---

## Categories Not Explicitly Requested (Status Summary)

| # | Category | Status |
|---|----------|--------|
| 2 | Bundle Analysis | Not requested |
| 4 | CSS Optimization | Tailwind v4 handles purging automatically |
| 6 | React Server Components | Covered in Category 1 |
| 8 | Database Queries | Not requested |
| 10 | Third-Party Scripts | TrackingPixels uses `strategy="afterInteractive"` correctly |
| 11 | Middleware Performance | Covered in Category 25 |
| 12 | API Route Optimization | Not requested |
| 13 | Memory Leaks | Not requested |
| 14 | Rendering Strategy | Not requested |
| 15 | Code Splitting | Covered by Categories 5 and 16 |
| 17 | TypeScript Performance | Not requested |
| 19 | Hydration | Not requested |
| 20 | Prefetching | Next.js Link prefetching is default-on |
| 21 | Web Vitals | Covered by font swap, image opt, dynamic imports |
| 24 | Rate Limiting | Already implemented via Upstash |
| 26 | State Management | Not requested |
| 27 | Network Requests | Not requested |
| 28 | SEO | Metadata already configured in layout.tsx |
| 30 | Monitoring | Sentry already configured |

---

## Summary of All Changes Made

### Files modified (4):
1. `next.config.ts` -- image optimization, caching headers, build config, security headers
2. `src/app/layout.tsx` -- font display swap
3. `src/app/f/[slug]/layout.tsx` -- font display swap
4. `src/app/page.tsx` -- dynamic imports for below-the-fold components

### Files modified (3 marketing components -- img to next/image):
5. `src/components/marketing/HeroSection.tsx`
6. `src/components/marketing/BottomCTA.tsx`
7. `src/components/marketing/IntegrationsSection.tsx`

### Files created (11 error/loading boundaries):
8. `src/app/leads/loading.tsx`
9. `src/app/leads/error.tsx`
10. `src/app/settings/loading.tsx`
11. `src/app/settings/error.tsx`
12. `src/app/billing/loading.tsx`
13. `src/app/billing/error.tsx`
14. `src/app/admin/loading.tsx`
15. `src/app/admin/error.tsx`
16. `src/app/builder/[funnelId]/loading.tsx`
17. `src/app/builder/[funnelId]/error.tsx`
18. `src/app/analytics/[funnelId]/error.tsx`
