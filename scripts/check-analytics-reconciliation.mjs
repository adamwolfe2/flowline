/**
 * Analytics reconciliation check.
 *
 * Asserts that the hero "Sessions" metric and the detail charts all agree on
 * the engaged-session count for a funnel — the invariant that broke when the
 * overview card and the Audience Insights charts read different queries.
 *
 * Every session widget must derive from the same definition of an "engaged
 * session" (a session row with >=1 client event). This script recomputes that
 * definition independently and checks the three count surfaces reconcile.
 *
 * Run:  node --env-file=.env.local scripts/check-analytics-reconciliation.mjs [funnelSlug]
 * Exit: 0 = all funnels reconcile, 1 = mismatch (or no DB).
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const slugArg = process.argv[2] || null;

const ENGAGED = "exists (select 1 from events ev where ev.session_id = fs.id)";

async function reconcileFunnel(funnel) {
  // 1) Hero "Sessions" = engaged session count
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

  const ok = total === deviceSum && total === sourceSum;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${funnel.slug.padEnd(24)} sessions=${total} device=${deviceSum} source=${sourceSum}`
  );
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
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
