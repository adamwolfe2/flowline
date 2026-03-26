# Comprehensive Codebase Audit - March 25, 2026

## Overview

Audit of the MyVSL codebase (159 source files) across 5 phases: dead code, security, performance, UX completeness, and build health.

---

## Phase 1: Dead Code & Type Safety

### Findings

**Unused Imports (5 found, 5 fixed)**

| File | Unused Import(s) | Status |
|------|------------------|--------|
| `src/app/api/cron/sequences/route.ts` | `isNotNull`, `isNull`, `lte` from drizzle-orm | Fixed |
| `src/app/api/funnels/route.ts` | `getFunnelsByUser` from queries/funnels | Fixed |
| `src/components/builder/TrackingEditor.tsx` | `ExternalLink` from lucide-react | Fixed |
| `src/components/marketing/HowItWorks.tsx` | `Users` from lucide-react | Fixed |
| `src/lib/webhook.ts` | `eq` from drizzle-orm | Fixed |

**Unused Catch Variable (1 found, 1 fixed)**

| File | Issue | Status |
|------|-------|--------|
| `src/app/leads/page.tsx:65` | `catch (err)` with unused `err` | Fixed: changed to `catch` |

**`any` Types**: None found. Codebase uses strict TypeScript throughout.

**`console.log` Statements**: None found outside of `src/lib/logger.ts` (which is the intended logger implementation).

---

## Phase 2: Security Quick Fixes

### Findings

**Auth Checks**: All 37 API route files audited. Every protected route has proper `auth()` from Clerk with `userId` null check. Public routes (events, sessions, submit, slugs/check, og, sequences/unsubscribe, webhooks/clerk, stripe/webhook) are correctly unauthenticated but rate-limited.

**Error Message Leaking**: All API routes return generic `"Internal server error"` to clients in catch blocks. Raw error details are only logged via `logger.error()`. No leaking found.

**Input Validation**: All routes validate input. UUID format checks exist on individual events, submit, sessions, leads, webhooks, and domain routes.

**UUID Validation Gap (1 found, 1 fixed)**

| File | Issue | Status |
|------|-------|--------|
| `src/app/api/events/batch/route.ts` | Missing UUID format validation on `sessionId` and `funnelId` (individual events route at `/api/events` had this validation, batch did not) | Fixed: added UUID regex check matching the individual route |

**SSRF Protection**: Webhook URL validation properly blocks internal IPs (localhost, 127.0.0.1, 10.x, 192.168.x, 172.16-31.x, 169.254.x, fc/fd IPv6, ::1). Present in both funnel creation and webhook test routes.

**Rate Limiting**: All public endpoints have rate limiters with Upstash Redis and in-memory fallback. Verified: submit, events, events/batch, sessions, slugs/check, og, og/funnel, ai/plan, ai/generate, upload/logo, admin/stats, analytics/shared, teams/invite.

---

## Phase 3: Performance

### Findings

**Database Indexes**: Schema has proper indexes on:
- `funnels.userId`
- `leads.funnelId`, `leads.funnelId + createdAt`
- `funnelSessions.funnelId`, `funnelSessions.funnelId + startedAt`
- `events.funnelId`, `events.sessionId`
- `variantAssignments.variantId`, `variantAssignments.funnelId`
- `sequenceEnrollments.status + nextSendAt`
- `webhookDeliveries.funnelId`

**N+1 Queries**: Analytics queries use `Promise.all` for concurrent execution. The `getVariantPerformance` function queries per-variant but is bounded by the 5-variant limit and uses `Promise.all`. The cron sequences route processes enrollments sequentially by design (each enrollment requires its own DB lookups and state changes). No actionable N+1 patterns found.

**React Performance**: Components are appropriately structured. The leads page uses `useMemo` for filtered/sorted display. The builder page uses `useCallback` for save functions. Marketing components use Framer Motion's `AnimatePresence` correctly.

### Flagged but not fixed

| Issue | Severity | Reason |
|-------|----------|--------|
| Missing `createdAt` index on `events` table | LOW | Events are primarily queried by `funnelId` and `sessionId` (indexed). Time-range filtering happens via session/lead timestamps instead. Adding this index would help analytics queries with time ranges but is not critical. |
| Cron route processes enrollments sequentially | LOW | By design - each enrollment has unique state transitions that depend on prior DB reads. Parallelizing could cause race conditions. |

---

## Phase 4: UX Completeness

### Findings

**Loading States**: All data-fetching pages have loading states:
- `/dashboard` - file-level `loading.tsx`
- `/analytics/[funnelId]` - file-level `loading.tsx`
- `/f/[slug]` - file-level `loading.tsx`
- `/admin` - inline loading state with text
- `/leads` - inline spinner
- `/settings` - skeleton pulse animation
- `/billing` - skeleton pulse animation
- `/builder/[funnelId]` - inline loading state

**Error States**: All pages handle errors appropriately:
- Global `error.tsx` and `global-error.tsx` exist
- API errors surface via `toast.error()` on client pages
- Admin page has dedicated error display for forbidden/failure states

**Empty States**: All list pages have proper empty states:
- Dashboard: branded empty state with CTA to create first funnel
- Leads: different empty states for "no filters match" vs "no leads yet"
- Admin: "No users yet", "No leads this month", "No custom domains"

**Accessibility (4 found, 4 fixed)**

| File | Issue | Status |
|------|-------|--------|
| `src/components/builder/ContentEditor.tsx` | Icon-only expand/collapse button missing aria-label | Fixed |
| `src/components/builder/BrandEditor.tsx` | Heading font select missing aria-label | Fixed |
| `src/components/builder/BrandEditor.tsx` | Body font select missing aria-label | Fixed |
| `src/components/builder/SequenceEditor.tsx` | Trigger type and trigger tier selects missing aria-labels | Fixed (2 selects) |

---

## Phase 5: Build Health

### Findings

**TypeScript**: `npx tsc --noEmit` passes with zero errors (before and after all fixes).

**Build**: `npm run build` completes successfully with no warnings. All 62 routes and pages compile. Static pages generate correctly.

**No ESLint Config**: The project has no `.eslintrc` or ESLint setup. This is a known gap documented in CLAUDE.md.

---

## Summary

| Phase | Found | Fixed | Flagged |
|-------|-------|-------|---------|
| Dead Code & Type Safety | 6 | 6 | 0 |
| Security | 1 | 1 | 0 |
| Performance | 2 | 0 | 2 (low severity) |
| UX / Accessibility | 4 | 4 | 0 |
| Build Health | 0 | 0 | 0 |
| **Total** | **13** | **11** | **2** |

### Files Modified

1. `src/app/api/cron/sequences/route.ts` - removed unused imports
2. `src/app/api/funnels/route.ts` - removed unused import
3. `src/app/api/events/batch/route.ts` - added UUID validation
4. `src/components/builder/TrackingEditor.tsx` - removed unused import
5. `src/components/builder/ContentEditor.tsx` - added aria-label
6. `src/components/builder/BrandEditor.tsx` - added 2 aria-labels
7. `src/components/builder/SequenceEditor.tsx` - added 2 aria-labels
8. `src/components/marketing/HowItWorks.tsx` - removed unused import
9. `src/lib/webhook.ts` - removed unused import
10. `src/app/leads/page.tsx` - removed unused catch variable

### Known Issues Not Addressed (from CLAUDE.md)

- Stripe price IDs not configured (env vars needed, not a code issue)
- No test suite (out of scope for this audit)
- No ESLint config (out of scope for this audit)
- Builder editor unusable on mobile <640px (needs dedicated redesign)
- Database migration needed for `share_token_expires_at` column
