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

export async function getDomainStatus(domain: string) {
  if (!VERCEL_PROJECT_ID) throw new Error("VERCEL_PROJECT_ID not configured");

  try {
    const result = await vercelFetch(
      `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`,
      { method: "POST" }
    );
    return {
      verified: result.verified ?? false,
      verification: result.verification ?? [],
    };
  } catch (error) {
    // If domain not found in Vercel, return unverified with empty verification
    if (error instanceof Error && error.message.includes("404")) {
      return { verified: false, verification: [] };
    }
    // For other errors, try to parse verification info from the error
    return { verified: false, verification: [] };
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
