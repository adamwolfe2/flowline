/**
 * Split a hostname into the parts most DNS providers ask for.
 *
 * For `form.meetcursive.com`:
 *   { host: "form", apex: "meetcursive.com", fqdn: "form.meetcursive.com" }
 *
 * For an apex domain `meetcursive.com`:
 *   { host: "@",    apex: "meetcursive.com", fqdn: "meetcursive.com" }
 *
 * Uses a simple "last 2 labels = apex" heuristic. This works correctly for
 * .com / .org / .net / .io / .co / .ai / .dev etc. It is wrong for the small
 * set of two-label ccTLDs (.co.uk, .com.au, .com.br …) — for those the host
 * will include the country segment. Since we always render BOTH the short
 * name and the FQDN in the UI, users on those TLDs can pick whichever their
 * provider accepts.
 */
export function splitDomainName(fqdn: string): {
  host: string;
  apex: string;
  fqdn: string;
} {
  const cleaned = fqdn.trim().toLowerCase().replace(/\.$/, "");
  const labels = cleaned.split(".");

  if (labels.length <= 2) {
    return { host: "@", apex: cleaned, fqdn: cleaned };
  }

  const apex = labels.slice(-2).join(".");
  const host = labels.slice(0, -2).join(".");
  return { host, apex, fqdn: cleaned };
}
