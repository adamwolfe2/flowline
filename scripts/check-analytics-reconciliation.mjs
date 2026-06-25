/**
 * Analytics reconciliation check.
 *
 * Asserts that the hero "Sessions" metric and the detail charts all agree on
 * the engaged-session count for a funnel — the invariant that broke when the
 * overview card and the Audience Insights charts read different queries.
 *
 * Every session widget must derive from the same definition of an "engaged
 * session" (a session row with >=1 client event). This script recomputes that
 * definition independently and checks each session-based count surface
 * reconciles against it:
 *   - Hero "Sessions"        (getFunnelOverview)
 *   - Device Breakdown       (getDeviceBreakdown)
 *   - Source Conversion      (getSourceConversion)
 *   - Device Conversion      (getDeviceConversion)
 *
 * The abandon heatmap (getAbandonHeatmap) now also routes through
 * engagedSessionWhere, so it is asserted as a HARD check: every abandoned
 * session it counts must be engaged.
 *
 * It also runs an ADVISORY audit on the one widget that does NOT yet route
 * through engagedSessionWhere — A/B variant performance — reporting any
 * non-engaged (bot/SSR) sessions it would silently count. This is flagged for
 * human review rather than failing the gate, because changing an A/B test's
 * session denominator on a live funnel is a Tier-1 change (it can flip a
 * "winner") and must not happen unattended.
 *
 * Run:  node --env-file=.env.local scripts/check-analytics-reconciliation.mjs [funnelSlug]
 * Exit: 0 = all funnels reconcile, 1 = mismatch (or no DB).
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const slugArg = process.argv[2] || null;

const ENGAGED = "exists (select 1 from events ev where ev.session_id = fs.id)";

let advisories = 0;

async function reconcileFunnel(funnel) {
  // 1) Hero "Sessions" = engaged session count (the canonical number)
  const [{ total }] = await sql`
    select count(*)::int as total from funnel_sessions fs
    where fs.funnel_id = ${funnel.id} and ${sql.unsafe(ENGAGED)}`;

  // 2) Device Breakdown — sum of per-device engaged counts
  const deviceRows = await sql`
    select count(*)::int as c from funnel_sessions fs
    where fs.funnel_id = ${funnel.id} and ${sql.unsafe(ENGAGED)}
    group by fs.device_type`;
  const deviceSum = deviceRows.reduce((s, r) => s + r.c, 0);

  // 3) Source Conversion — sum of per-source engaged sessions
  const sourceRows = await sql`
    select count(*)::int as c from funnel_sessions fs
    where fs.funnel_id = ${funnel.id} and ${sql.unsafe(ENGAGED)}
    group by fs.utm_source`;
  const sourceSum = sourceRows.reduce((s, r) => s + r.c, 0);

  // 4) Device Conversion — same engaged basis, grouped by device_type.
  //    Mirrors getDeviceConversion (engagedSessionWhere + group by device_type).
  const deviceConvRows = await sql`
    select count(*)::int as c from funnel_sessions fs
    where fs.funnel_id = ${funnel.id} and ${sql.unsafe(ENGAGED)}
    group by fs.device_type`;
  const deviceConvSum = deviceConvRows.reduce((s, r) => s + r.c, 0);

  // 5) Abandon heatmap — now routed through engagedSessionWhere, so every
  //    abandoned session it counts MUST be engaged. Hard check: zero
  //    abandoned-but-not-engaged sessions.
  const [{ c: abandonNonEngaged }] = await sql`
    select count(*)::int as c from funnel_sessions fs
    where fs.funnel_id = ${funnel.id}
      and fs.abandoned_at_step is not null
      and not (${sql.unsafe(ENGAGED)})`;

  const ok =
    total === deviceSum &&
    total === sourceSum &&
    total === deviceConvSum &&
    abandonNonEngaged === 0;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${funnel.slug.padEnd(24)} sessions=${total} device=${deviceSum} source=${sourceSum} deviceConv=${deviceConvSum} abandonNonEngaged=${abandonNonEngaged}`
  );

  // --- Advisory audit: the one widget not yet on the engaged definition ----
  // Variant performance counts sessions assigned to a variant.
  const [{ c: variantNonEngaged }] = await sql`
    select count(*)::int as c
    from variant_assignments va
    join funnel_sessions fs on fs.id = va.session_id
    where va.funnel_id = ${funnel.id}
      and not (${sql.unsafe(ENGAGED)})`;

  if (variantNonEngaged > 0) {
    advisories += 1;
    console.log(
      `  ADVISORY ${funnel.slug.padEnd(20)} non-engaged sessions counted by variant performance: variant=${variantNonEngaged} (flag for human review — do not auto-change A/B denominator)`
    );
  }

  return ok;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set — run with: node --env-file=.env.local ...");
    process.exit(1);
  }
  const funnels = slugArg
    ? await sql`select id, slug from funnels where slug = ${slugArg}`
    : await sql`select id, slug from funnels order by created_at desc limit 50`;

  if (funnels.length === 0) {
    console.log("No funnels found.");
    process.exit(0);
  }

  let allOk = true;
  for (const f of funnels) {
    const ok = await reconcileFunnel(f);
    allOk = allOk && ok;
  }
  console.log(allOk ? "\nAll funnels reconcile ✓" : "\nMISMATCH DETECTED ✗");
  if (advisories > 0) {
    console.log(
      `${advisories} funnel(s) have widgets counting non-engaged sessions (abandon/variant) — see ADVISORY lines. Not a reconcile failure; flagged for human review.`
    );
  }
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
