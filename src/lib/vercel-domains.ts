import { logger } from "./logger";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

const VERCEL_API = "https://api.vercel.com";

async function vercelFetch(path: string, options: RequestInit = {}) {
  if (!VERCEL_TOKEN) throw new Error("VERCEL_TOKEN not configured");

  const url = VERCEL_TEAM_ID
    ? `${VERCEL_API}${path}${path.includes("?") ? "&" : "?"}teamId=${VERCEL_TEAM_ID}`
    : `${VERCEL_API}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    logger.error("Vercel API error", { path, status: res.status, error: data });
    throw new Error(data.error?.message || `Vercel API error: ${res.status}`);
  }

  return data;
}

export async function addDomainToVercel(domain: string) {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");

  return vercelFetch(`/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });
}

export type DomainStatusReason =
  | "verified"
  | "not_attached_to_project"
  | "dns_not_propagated"
  | "verification_pending"
  | "https_not_ready"
  | "unknown";

export type DomainStatus = {
  verified: boolean;
  verification: Array<{ type: string; domain: string; value: string; reason: string }>;
  reason: DomainStatusReason;
  httpsReady?: boolean;
};

export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");

  let attachedToProject = true;
  let verified = false;
  let verification: Array<{ type: string; domain: string; value: string; reason: string }> = [];

  try {
    const result = await vercelFetch(
      `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`,
      { method: "POST" }
    );
    verified = result.verified ?? false;
    verification = result.verification ?? [];
  } catch (error) {
    // If the domain isn't attached to the project, Vercel returns 404. We
    // surface that distinctly — DNS may resolve correctly via the Vercel
    // catch-all even when the domain isn't actually on the project, which
    // means HTTPS never works and the user sees a cert error.
    if (error instanceof Error && error.message.includes("404")) {
      attachedToProject = false;
    }
    // Other errors fall through to unverified
  }

  if (!attachedToProject) {
    return { verified: false, verification: [], reason: "not_attached_to_project" };
  }

  if (!verified) {
    return {
      verified: false,
      verification,
      reason: verification.length > 0 ? "verification_pending" : "dns_not_propagated",
    };
  }

  // Vercel says verified — confirm HTTPS actually serves, since the cert can
  // take 30-60s to issue after the domain is added.
  const httpsReady = await checkHttpsReachable(domain);

  return {
    verified: httpsReady,
    verification: [],
    reason: httpsReady ? "verified" : "https_not_ready",
    httpsReady,
  };
}

async function checkHttpsReachable(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://${domain}/`, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "manual",
    });
    clearTimeout(timeout);
    return res.status > 0;
  } catch {
    return false;
  }
}

export async function removeDomainFromVercel(domain: string) {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");

  return vercelFetch(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
    method: "DELETE",
  });
}

export async function getDomainConfig(domain: string) {
  try {
    return await vercelFetch(`/v6/domains/${domain}/config`);
  } catch {
    return null;
  }
}

export async function verifyDomain(domain: string) {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");

  try {
    return await vercelFetch(`/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`, {
      method: "POST",
    });
  } catch {
    return null;
  }
}

export async function listProjectDomains() {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");
  return vercelFetch(`/v9/projects/${VERCEL_PROJECT_ID}/domains`);
}

export function isVercelConfigured() {
  return !!(VERCEL_TOKEN && VERCEL_PROJECT_ID);
}
