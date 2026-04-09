/**
 * Test 1: Public Funnel Render + Lead Capture
 *
 * This is the most critical test in the suite. If a published funnel fails to
 * load or the lead-capture form breaks, customers lose real leads.
 *
 * Required env:
 *   PLAYWRIGHT_BASE_URL             - App URL (default: http://localhost:3000)
 *   PLAYWRIGHT_FIXTURE_FUNNEL_SLUG  - Slug of a published funnel (e.g. "my-test-funnel")
 *
 * If PLAYWRIGHT_FIXTURE_FUNNEL_SLUG is not set, the test is marked fixme.
 * To enable it: publish a funnel from your dashboard, copy its slug, then set the env var.
 */

import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const FUNNEL_SLUG = process.env.PLAYWRIGHT_FIXTURE_FUNNEL_SLUG || "";

test.describe("Public funnel render + lead capture", () => {
  test.beforeEach(() => {
    if (!FUNNEL_SLUG) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_FIXTURE_FUNNEL_SLUG to a published funnel slug to enable this test."
      );
    }
  });

  test("funnel page loads and quiz welcome step is visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/f/${FUNNEL_SLUG}`);

    // Page must return a 200 — notFound() returns 404 which Playwright follows
    await expect(page).not.toHaveURL(/\/not-found/);

    // The quiz headline rendered by FunnelClient must be visible
    // FunnelClient renders the brand name / quiz headline in the first step
    await expect(
      page.locator("h1, h2").first()
    ).toBeVisible({ timeout: 15000 });

    // Verify no error boundary was triggered
    await expect(
      page.locator("[data-testid='error-boundary']")
    ).not.toBeVisible();
  });

  test("quiz steps are clickable and email capture step appears", async ({ page }) => {
    await page.goto(`${BASE_URL}/f/${FUNNEL_SLUG}`);
    await page.waitForLoadState("networkidle");

    // Click through all answer options — the quiz has 1+ questions
    // We click the first option on each question step until we reach the email step
    const maxSteps = 10;
    for (let i = 0; i < maxSteps; i++) {
      // Check if we've reached the email input step
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }

      // Click the first answer option on this question step
      const answerButton = page.locator("button").filter({ hasNotText: /back|prev/i }).first();
      if (!(await answerButton.isVisible({ timeout: 3000 }).catch(() => false))) {
        break;
      }
      await answerButton.click();
    }

    // Email input must appear after all quiz questions are answered
    await expect(
      page.locator('input[type="email"]')
    ).toBeVisible({ timeout: 10000 });
  });

  test("submitting email creates a lead and shows success state", async ({ page, request }) => {
    await page.goto(`${BASE_URL}/f/${FUNNEL_SLUG}`);
    await page.waitForLoadState("networkidle");

    const testEmail = `e2e-test-${Date.now()}@playwright.test`;

    // Navigate through quiz to email step
    const maxSteps = 10;
    for (let i = 0; i < maxSteps; i++) {
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      const answerButton = page.locator("button").filter({ hasNotText: /back|prev/i }).first();
      if (!(await answerButton.isVisible({ timeout: 3000 }).catch(() => false))) {
        break;
      }
      await answerButton.click();
    }

    // Fill email and submit
    await page.locator('input[type="email"]').fill(testEmail);

    // Wait for the submit API response
    const submitPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/submit/") && resp.request().method() === "POST",
      { timeout: 15000 }
    );

    await page.locator('button[type="submit"], form button').last().click();
    const submitResponse = await submitPromise;

    expect(submitResponse.status()).toBe(200);
    const body = await submitResponse.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toBeTruthy();

    // Success state must be visible (calendar link, thank-you message, etc.)
    // The FunnelClient renders either a redirect or a success screen
    const successIndicators = page.locator(
      "text=/thank|success|book|calendar|schedule/i"
    );
    await expect(successIndicators.first()).toBeVisible({ timeout: 10000 });
  });
});
