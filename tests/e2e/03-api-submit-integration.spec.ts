/**
 * Test 3: /api/submit/[funnelId] Integration
 *
 * Validates the lead submission endpoint directly via the Playwright request API.
 * No browser UI needed — these are pure HTTP-level integration tests.
 *
 * What this covers:
 *   - Valid submission creates a lead (200 + leadId)
 *   - Duplicate email returns the existing lead (200 + updated: true)
 *   - Missing / invalid email returns 400
 *   - Invalid funnelId format returns 400
 *   - Non-existent funnelId returns 404
 *
 * Required env:
 *   PLAYWRIGHT_BASE_URL            - App URL
 *   PLAYWRIGHT_FIXTURE_FUNNEL_SLUG - Slug of a published funnel
 *   PLAYWRIGHT_TEST_USER_EMAIL     - Clerk test user email (for verifying lead was created)
 *   PLAYWRIGHT_TEST_USER_PASSWORD  - Clerk test user password
 *
 * The submission tests run without auth (the submit endpoint is public).
 * The lead verification step requires auth via a signed-in page context.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const FUNNEL_SLUG = process.env.PLAYWRIGHT_FIXTURE_FUNNEL_SLUG || "";
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD || "";

// We need the funnelId (UUID) for the submit endpoint.
// We look it up from the public funnel page response headers or a known slug.
// Since funnelId is embedded as a prop in FunnelClient, we parse it from the page.
async function getFunnelIdFromSlug(
  request: import("@playwright/test").APIRequestContext,
  slug: string
): Promise<string | null> {
  // The funnel page server component passes funnelId to FunnelClient as a prop.
  // It also appears in the submit URL triggered by the form.
  // Simplest approach: GET the public page and regex the UUID from the HTML.
  const res = await request.get(`${BASE_URL}/f/${slug}`);
  if (!res.ok()) return null;
  const html = await res.text();
  // Next.js serializes server component props as __NEXT_DATA__ or inline script
  const match = html.match(/"funnelId":"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/i);
  return match ? match[1] : null;
}

const VALID_ANSWERS = {
  q1: "opt_a",
  q2: "opt_x",
};

test.describe("/api/submit integration", () => {
  let funnelId: string;

  test.beforeAll(async ({ request }) => {
    if (!FUNNEL_SLUG) return;
    const id = await getFunnelIdFromSlug(request, FUNNEL_SLUG);
    if (id) funnelId = id;
  });

  test.beforeEach(() => {
    if (!FUNNEL_SLUG) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_FIXTURE_FUNNEL_SLUG to enable submit integration tests."
      );
    }
  });

  test("valid submission returns 200 with leadId", async ({ request }) => {
    if (!funnelId) {
      test.fixme(true, "Could not resolve funnelId from PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.");
      return;
    }

    const email = `e2e-submit-${Date.now()}@playwright.test`;
    const res = await request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { email, answers: VALID_ANSWERS },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.leadId).toBe("string");
    expect(body.leadId.length).toBeGreaterThan(0);
    expect(typeof body.score).toBe("number");
    expect(["high", "mid", "low"]).toContain(body.calendarTier);
  });

  test("duplicate email returns 200 with updated: true", async ({ request }) => {
    if (!funnelId) {
      test.fixme(true, "Could not resolve funnelId from PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.");
      return;
    }

    const email = `e2e-dup-${Date.now()}@playwright.test`;

    // First submission
    await request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { email, answers: VALID_ANSWERS },
    });

    // Second submission with same email — should update, not create duplicate
    const res = await request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { email, answers: { q1: "opt_b", q2: "opt_y" } },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.updated).toBe(true);
  });

  test("missing email returns 400", async ({ request }) => {
    if (!funnelId) {
      test.fixme(true, "Could not resolve funnelId from PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.");
      return;
    }

    const res = await request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { answers: VALID_ANSWERS },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("malformed email returns 400", async ({ request }) => {
    if (!funnelId) {
      test.fixme(true, "Could not resolve funnelId from PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.");
      return;
    }

    const res = await request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { email: "not-an-email", answers: VALID_ANSWERS },
    });

    expect(res.status()).toBe(400);
  });

  test("invalid funnelId format returns 400", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/submit/not-a-uuid`, {
      data: {
        email: "test@playwright.test",
        answers: VALID_ANSWERS,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid funnel id/i);
  });

  test("non-existent funnelId returns 404", async ({ request }) => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const res = await request.post(`${BASE_URL}/api/submit/${nonExistentId}`, {
      data: {
        email: "test@playwright.test",
        answers: VALID_ANSWERS,
      },
    });

    expect(res.status()).toBe(404);
  });

  test("lead created via submit appears in authenticated leads list", async ({ page }) => {
    if (!funnelId) {
      test.fixme(true, "Could not resolve funnelId from PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.");
      return;
    }
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD to verify lead creation."
      );
      return;
    }

    const testEmail = `e2e-verify-${Date.now()}@playwright.test`;

    // Submit lead without auth (public endpoint)
    const submitRes = await page.request.post(`${BASE_URL}/api/submit/${funnelId}`, {
      data: { email: testEmail, answers: VALID_ANSWERS },
    });
    expect(submitRes.ok()).toBeTruthy();
    const { leadId } = await submitRes.json();

    // Sign in to verify the lead exists
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState("networkidle");
    await page.locator('input[name="identifier"], input[type="email"]').first().fill(TEST_EMAIL);
    await page.locator('button[type="submit"]').click();
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 20000 });

    // Fetch the leads list scoped to this funnel and find our lead
    const leadsRes = await page.request.get(
      `${BASE_URL}/api/leads?funnelId=${funnelId}&limit=100`
    );
    expect(leadsRes.ok()).toBeTruthy();
    const { leads } = await leadsRes.json();

    const found = (leads as Array<{ id: string; email: string }>).find(
      (l) => l.id === leadId || l.email === testEmail
    );
    expect(found).toBeTruthy();
  });
});
