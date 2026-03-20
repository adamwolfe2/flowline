# Codebase Cleanup Report
**Date:** 2026-03-19
**Project:** MyVSL (Flowline)
**Branch:** cleanup/2026-03-19

## Impact Summary

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total Files | 204 | 195 | 9 (4.4%) |
| Lines of Code | 18,756 | 18,614 | 142 (0.8%) |
| Dependencies | 28 | 28 | 0 |
| DevDependencies | 9 | 9 | 0 |
| API Routes | 39 | 39 | 0 |
| Pages | 20 | 20 | 0 |
| Components | 54 | 53 | 1 |

## Files Removed (13)
- `src/components/marketing/FeaturesSection.tsx` -- orphaned component, never imported after ProductDemo replaced it
- `src/hooks/useInView.ts` -- custom hook superseded by framer-motion's built-in useInView
- `src/lib/supabase/schema.sql` -- leftover from early prototyping, project uses Neon + Drizzle
- `public/vercel.svg` -- Next.js starter template artifact, never referenced
- `public/next.svg` -- Next.js starter template artifact, never referenced
- `public/window.svg` -- Next.js starter template artifact, never referenced
- `public/globe.svg` -- Next.js starter template artifact, never referenced
- `public/file.svg` -- Next.js starter template artifact, never referenced
- `public/logo-original.png` -- superseded by logo.png, never referenced
- `HARDENING_REPORT.md` -- session artifact, findings already applied to code
- `OVERNIGHT-AUDIT-REPORT.md` -- session artifact, findings already applied
- `REFINEMENT_REPORT.md` -- session artifact, findings already applied
- `SECURITY_AUDIT.md` -- session artifact, findings already applied

## Dead Code Removed
- `src/lib/rate-limit.ts::rateLimitHeaders()` -- exported utility function with zero imports across codebase
- Empty directories removed: `src/hooks/`, `src/lib/supabase/`

## What Was Intentionally Kept
- **All 28 dependencies** -- every one is actively imported and used (svix for Clerk webhooks, @base-ui/react for 11 UI components, etc.)
- **All 39 API routes** -- each has either frontend callers or is a webhook/cron endpoint
- **All 20 pages** -- each is either navigation-linked or designed for deep linking (shared analytics, invite acceptance, custom domains)
- **STRIPE_SETUP.md, README.md** -- useful reference documentation
- **`@neondatabase/serverless@1.0.2`** -- noted as potential downgrade candidate but works in production; changing would need regression testing
