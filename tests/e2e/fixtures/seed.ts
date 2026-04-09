/**
 * Seed helpers for E2E tests.
 *
 * These helpers create the minimal data fixtures needed by the tests.
 * They call the app's own API routes so no direct DB access is needed.
 *
 * IMPORTANT: Never run these against production.
 * Set PLAYWRIGHT_BASE_URL to a staging/local environment.
 *
 * Usage (from a test):
 *   import { createTestFunnel, FunnelFixture } from './fixtures/seed'
 *   const fixture = await createTestFunnel(request, authToken)
 */

import type { APIRequestContext } from "@playwright/test";

export interface FunnelFixture {
  funnelId: string;
  slug: string;
  publicUrl: string;
}

/**
 * Minimal quiz funnel config that satisfies the FunnelConfig shape.
 * Two questions — enough to exercise scoring + tier assignment.
 */
export function buildMinimalFunnelConfig() {
  return {
    brand: {
      name: "E2E Test Funnel",
      logoUrl: "",
      primaryColor: "#2D6A4F",
      primaryColorLight: "#e8f5e9",
      primaryColorDark: "#1b4332",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
    quiz: {
      headline: "Playwright E2E Test Headline",
      subheadline: "This funnel exists only for automated testing",
      questions: [
        {
          key: "q1",
          label: "What best describes your business?",
          options: [
            { id: "opt_a", label: "Coaching / consulting", points: 10 },
            { id: "opt_b", label: "E-commerce", points: 5 },
            { id: "opt_c", label: "Other", points: 1 },
          ],
        },
        {
          key: "q2",
          label: "How quickly do you need results?",
          options: [
            { id: "opt_x", label: "Within 30 days", points: 10 },
            { id: "opt_y", label: "3-6 months", points: 5 },
            { id: "opt_z", label: "No rush", points: 1 },
          ],
        },
      ],
      thresholds: { high: 15, mid: 8 },
      calendars: {
        high: "https://cal.com/test/high",
        mid: "https://cal.com/test/mid",
        low: "https://cal.com/test/low",
      },
    },
    webhook: { url: "" },
    meta: {
      title: "E2E Test Funnel",
      description: "Playwright automated test funnel",
    },
  };
}

/**
 * Creates a published test funnel via the API.
 * Requires a valid Clerk session cookie in the request context.
 *
 * Returns the funnelId, slug, and public URL.
 * Throws if creation or publish fails.
 */
export async function createTestFunnel(
  request: APIRequestContext,
  baseUrl: string
): Promise<FunnelFixture> {
  // Create the funnel
  const createRes = await request.post(`${baseUrl}/api/funnels`, {
    data: {
      name: "E2E Test Funnel",
      templateId: null,
    },
  });

  if (!createRes.ok()) {
    const body = await createRes.text();
    throw new Error(
      `Failed to create test funnel: ${createRes.status()} ${body}`
    );
  }

  const created = await createRes.json();
  const funnelId: string = created.id;
  const slug: string = created.slug;

  // Update config with our known test data
  const patchRes = await request.patch(`${baseUrl}/api/funnels/${funnelId}`, {
    data: { config: buildMinimalFunnelConfig() },
  });

  if (!patchRes.ok()) {
    const body = await patchRes.text();
    throw new Error(
      `Failed to patch test funnel config: ${patchRes.status()} ${body}`
    );
  }

  // Publish it
  const publishRes = await request.post(
    `${baseUrl}/api/funnels/${funnelId}/publish`,
    { data: {} }
  );

  if (!publishRes.ok()) {
    const body = await publishRes.text();
    throw new Error(
      `Failed to publish test funnel: ${publishRes.status()} ${body}`
    );
  }

  return {
    funnelId,
    slug,
    publicUrl: `${baseUrl}/f/${slug}`,
  };
}

/**
 * Deletes a test funnel via the API.
 * Call this in afterAll blocks to clean up.
 */
export async function deleteTestFunnel(
  request: APIRequestContext,
  baseUrl: string,
  funnelId: string
): Promise<void> {
  await request.delete(`${baseUrl}/api/funnels/${funnelId}`);
}
