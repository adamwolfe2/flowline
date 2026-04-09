/**
 * Test 4: Stripe Checkout Session Creation
 *
 * Verifies that the billing upgrade flow initiates a Stripe checkout session.
 * We do NOT complete the payment — we only verify that:
 *   1. The /billing page loads for an authenticated user
 *   2. Clicking Upgrade triggers a POST to /api/billing/checkout
 *   3. The API returns a valid Stripe checkout URL (or a known "not configured" 503)
 *
 * The test accommodates two real-world states:
 *   - Stripe price IDs ARE configured  → expects a checkout URL redirect
 *   - Stripe price IDs NOT configured  → expects a 400/503 with a clear error
 *     (this is documented in CLAUDE.md as "What Still Needs Work")
 *
 * Required env:
 *   PLAYWRIGHT_BASE_URL           - App URL
 *   PLAYWRIGHT_TEST_USER_EMAIL    - Clerk test user email
 *   PLAYWRIGHT_TEST_USER_PASSWORD - Clerk test user password
 *
 * NEVER run this against production with a real payment method.
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD || "";

const MISSING_AUTH = !TEST_EMAIL || !TEST_PASSWORD;

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForLoadState("networkidle");
  await page.locator('input[name="identifier"], input[type="email"]').first().fill(TEST_EMAIL);
  await page.locator('button[type="submit"]').click();
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 20000,
  });
}

test.describe("Stripe checkout session creation", () => {
  test.beforeEach(() => {
    if (MISSING_AUTH) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD to enable billing tests."
      );
    }
  });

  test("/billing page loads for authenticated user", async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/billing/);

    // The billing page renders plan cards — verify at least one upgrade button is visible
    await expect(
      page.locator("button").filter({ hasText: /upgrade|get pro|get agency/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("checkout API returns a valid response (configured or not)", async ({ page }) => {
    await signIn(page);

    // POST directly to the checkout endpoint to check the response shape
    const res = await page.request.post(`${BASE_URL}/api/billing/checkout`, {
      data: { priceId: "pro_monthly" },
    });

    if (res.status() === 400) {
      // Price IDs not configured — expected in staging without Stripe setup
      const body = await res.json();
      expect(body.error).toBeTruthy();
      // Acceptable: "Invalid or unconfigured plan" or "Stripe price not configured"
      expect(typeof body.error).toBe("string");
    } else if (res.status() === 503) {
      // Stripe secret key not configured
      const body = await res.json();
      expect(body.error).toBeTruthy();
    } else if (res.status() === 200) {
      // Stripe IS configured — verify we get a checkout URL
      const body = await res.json();
      expect(body.url).toBeTruthy();
      expect(body.url).toMatch(/checkout\.stripe\.com/);
    } else {
      // Any other status is unexpected
      const status = res.status();
      expect(
        [200, 400, 503],
        `Unexpected checkout response status: ${status}`
      ).toContain(status);
    }
  });

  test("upgrade button click triggers checkout API call", async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState("networkidle");

    // Intercept the checkout request so we don't actually redirect to Stripe
    const checkoutPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/billing/checkout") &&
        resp.request().method() === "POST",
      { timeout: 15000 }
    );

    // Click the Pro upgrade button
    const upgradeButton = page
      .locator("button")
      .filter({ hasText: /upgrade|get pro/i })
      .first();
    await upgradeButton.click();

    const checkoutResponse = await checkoutPromise;

    // The response must be from our checkout API regardless of configuration state
    expect([200, 400, 503]).toContain(checkoutResponse.status());

    const body = await checkoutResponse.json();
    // Whether it succeeds or fails, the response must be JSON with a clear field
    expect(body.url || body.error).toBeTruthy();
  });
});
