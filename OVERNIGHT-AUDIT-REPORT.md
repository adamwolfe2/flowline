# Overnight Audit Report — MyVSL (Flowline)

**Date**: 2026-03-18
**Branch**: `overnight-improvements-2026-03-18`
**Total files modified**: 28 modified, 4 created (32 total)

---

## Build Status

| Metric | Before | After |
|--------|--------|-------|
| Build | PASS | PASS |
| TypeScript errors | 0 | 0 |
| Warnings | 1 (middleware deprecation) | 1 (same — Next.js upstream) |
| Tests | N/A (no test suite) | N/A |
| Routes | 32 | 33 (+sitemap.xml) |

---

## Changes by Category

### Critical Fixes (5 issues)
- **API input validation**: Added prompt validation to AI generate endpoint (returns 400 on empty/missing)
- **Traffic weight clamping**: Variant traffic weight now clamped to 0-100 range
- **Domain length validation**: Custom domain endpoint rejects domains > 255 chars
- **Error logging**: Share route catch blocks no longer silently swallow errors
- **Silent error handling**: Leads page and TeamSettings now log fetch failures

### Code Quality (5 issues)
- Removed 4 unused imports (`asc`, `Trash2`, `Plus`, `Loader2`)
- Replaced `(window as any)` casts with proper TypeScript Window interface declarations for Cal, fbq, ttq, gtag, dataLayer
- Fixed SequenceEditor using index as React key — now uses `step.id` with index fallback
- Fixed ContentBlockDisplay missing alt text on images

### Accessibility (16 fixes)
- Added `aria-label` to 9 icon-only buttons (trash, preview toggle, pagination, close)
- Added `aria-label` to 7 form inputs missing labels (color pickers, search, textareas, email)
- Added `loading="lazy"` to below-fold images (LogoStrip, ContentBlockDisplay)
- Added `aria-busy="true"` and `role="status"` to builder loading state

### SEO & Metadata (7 fixes)
- Added `description` to builder and analytics layout metadata
- Created layout files with metadata for sign-in, sign-up, and invite pages
- Added `url` field to root layout OpenGraph config
- Created `/sitemap.xml` with homepage, pricing, terms, privacy
- Added `/billing/` to robots.txt disallow list

### Security (1 fix)
- Added `X-XSS-Protection: 1; mode=block` header to next.config.ts

---

## Not Changed (by design)

- **Payment/billing logic**: No changes to Stripe checkout, webhooks, or pricing
- **Database schema**: No migrations or schema changes
- **Dependencies**: No package additions, removals, or version changes
- **Environment variables**: No changes to .env.local or Vercel env vars
- **Business logic**: No changes to funnel rendering, lead capture, or analytics
- **Middleware**: No changes to domain routing or auth logic

---

## Known Issues Not Fixed (documented as TODOs)

1. **BLOB_READ_WRITE_TOKEN**: Vercel Blob store not linked to production — logo uploads return 503
2. **Sentry DSN**: Sentry code is ready but DSN env var not set
3. **No test suite**: Project has zero tests — recommend adding at minimum API route tests
4. **Middleware deprecation warning**: Next.js 16 deprecates `middleware.ts` in favor of `proxy` — upstream migration needed
5. **CSP headers**: No Content-Security-Policy header configured (complex to set up correctly with inline scripts for tracking pixels)
6. **Rate limiting on shared analytics**: Public `/api/analytics/shared/[token]` endpoint has no rate limiting (low risk since tokens are random hex)

---

## Commits

```
2da2880 chore: SEO metadata, sitemap, security headers
1c6259a a11y: accessibility improvements and type safety across components
33833f0 fix: API validation, error handling, and unused import cleanup
```

---

## Recommended Next Steps

1. Merge this branch to main: `git checkout main && git merge overnight-improvements-2026-03-18`
2. Push to trigger Vercel deployment
3. Set up Sentry DSN environment variable
4. Link Vercel Blob store for logo uploads
5. Consider adding basic API route tests with vitest
6. Plan middleware → proxy migration when Next.js docs stabilize
