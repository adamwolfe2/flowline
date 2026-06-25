# Bot-session root cause — design + guarded diff (FLAGGED RED, human review)

Status: **NOT IMPLEMENTED in the live tracking path.** This is the design + a guarded
diff for a Tier-1 change to the funnel-tracking path that real visitors hit. It must be
verified by a human (and ideally load/race-tested against a staging funnel) before it ships,
per the overnight prime directive (NO USER ERRORS).

## Problem

`src/app/f/[slug]/page.tsx` and `src/app/f/domain/[hostname]/page.tsx` call `insertSession()`
on **every SSR render**. Bots, link-preview crawlers (Slack/Twitter/iMessage), uptime checks,
and Next.js SSR previews all load the page, create a `funnel_sessions` row, but never run the
quiz JS — so they fire zero events. The `funnel_sessions` table accumulates these bot rows
indefinitely.

Downstream this is already mitigated: every session-based widget filters through
`engagedSessionWhere` (a session with ≥1 client event) in `src/db/queries/analytics.ts`, so
the hero metrics and detail charts are honest. **The numbers shown to users are correct
today.** The remaining problems are at the source:

1. The table grows with junk rows (storage + query cost).
2. Variant assignment is recorded SSR (`page.tsx` line ~90), so bot sessions get an A/B
   variant assignment. This is why `getVariantPerformance` counts non-engaged sessions
   (reconciliation script flags 13 such rows as of 2026-06-25). A/B denominators are slightly
   inflated by bots that were assigned a variant but never engaged.

## Why this was NOT auto-implemented

`events.session_id` has a **NOT NULL FK** to `funnel_sessions.id`
(`schema.ts` line 101: `references(() => funnelSessions.id)`). The naive "create lazily on first
event" fix means the `/api/events` route must create the session row before the first event
insert. That path has three live-visitor hazards:

- **FK violation → silent data loss.** The events route swallows all errors
  (`catch` at route.ts line 107 returns `{ success: true }`). If session creation races or
  fails, the first real visitor's events vanish with no surfaced error — the exact "user error"
  the directive forbids.
- **Race on session creation.** At funnel start the client fires several events nearly
  simultaneously (`funnel_viewed`, `page_viewed`). Two concurrent POSTs would both try to
  create the same session. Needs an idempotent upsert keyed by a client-generated session UUID,
  not a server-generated one.
- **Variant assignment moves.** `recordAssignment` currently runs SSR with the server session
  id. Lazy creation forces it client-side or into the first-event handler, changing when a
  visitor is bucketed — a real risk of mis-attributing or double-assigning A/B traffic.

Any of these silently breaks tracking/attribution for real paying customers' funnels. That is
not verifiable-safe in an unattended run.

## Recommended approach (preferred): client-generated session id + idempotent upsert

The lowest-risk shape, but still requires human verification + a staging soak:

1. **Client generates the session UUID** (`crypto.randomUUID()`) on mount in `FunnelClient`,
   instead of receiving it from SSR. SSR stops calling `insertSession` entirely.
2. **First event upserts the session.** `/api/events` does
   `insert ... on conflict (id) do nothing` for the session row (with funnelId, deviceType, utm
   from the event payload) *before* inserting the event. Idempotent, race-safe, FK satisfied.
3. **Variant selection moves to first event** (or a dedicated `/api/funnels/:id/assign` call the
   client makes once on mount), keyed by the client session id. Bots that never run JS never
   create a session and never get a variant assignment → the variant denominator becomes
   engaged-only for free.
4. Net effect: a `funnel_sessions` row exists **iff** the visitor ran JS and fired ≥1 event.
   `engagedSessionWhere` becomes redundant (but keep it as a belt-and-suspenders filter).

This is **non-destructive**: no historical rows are deleted. Old bot rows stay but are already
excluded by `engagedSessionWhere`. A later, separate, reviewed cleanup job can archive rows with
zero events if desired — explicitly out of scope here.

## Alternative (smaller blast radius): flag instead of lazy-create

Keep SSR session creation but add an `is_bot boolean default false` column and set it when the
user-agent matches a known bot/crawler list (and/or when `furthest_step_reached = 0` and the
session is older than N minutes via a sweep). All widgets then add `and not is_bot`. This is
less invasive (no change to event timing / FK / variant flow) but only catches *known* bots and
still creates the rows. It is the safer increment if the team wants to avoid touching the event
path at all.

### Guarded migration for the flag approach (additive, safe — teams table has rows, this is a new nullable-with-default column so no rewrite risk):

```sql
-- drizzle migration (generate via: npx drizzle-kit generate)
ALTER TABLE "funnel_sessions" ADD COLUMN "is_bot" boolean DEFAULT false NOT NULL;
```

Schema change (`src/db/schema.ts`, inside `funnelSessions`):

```ts
isBot: boolean('is_bot').default(false).notNull(),
```

Then in both SSR pages, replace the bare `insertSession(...)` with a UA-classified call and
have `engagedSessionWhere` add `and not ${funnelSessions.isBot}`. Still requires a human to
choose + tune the bot UA list and verify no real UA is misclassified.

## Decision

FLAGGED **RED**. Both approaches change the live-visitor tracking/attribution path. They are
designed and ready for a human to pick one, verify on a staging funnel (including a concurrency/
race test on `/api/events`), and ship via `safe-feature-slice`. Do not merge unattended.
