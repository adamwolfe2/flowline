/**
 * Test 2: Funnel Edit + Publish
 *
 * Verifies that an authenticated user can open a funnel in the builder,
 * make a config change, save it, publish it, and see the update on the
 * public URL.
 *
 * Required env:
 *   PLAYWRIGHT_BASE_URL            - App URL
 *   PLAYWRIGHT_TEST_USER_EMAIL     - Clerk test user email
 *   PLAYWRIGHT_TEST_USER_PASSWORD  - Clerk test user password
 *   PLAYWRIGHT_FIXTURE_FUNNEL_SLUG - Slug of a funnel owned by the test user
 *
 * Authentication approach: Clerk's test mode allows email/password sign-in
 * at the standard /sign-in route.
 *
 * If any required env var is missing, the tests are marked fixme.
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_USER_EMAIL || "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_USER_PASSWORD || "";
const FUNNEL_SLUG = process.env.PLAYWRIGHT_FIXTURE_FUNNEL_SLUG || "";

const MISSING_AUTH = !TEST_EMAIL || !TEST_PASSWORD;
const MISSING_SLUG = !FUNNEL_SLUG;

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`);
  await page.waitForLoadState("networkidle");

  // Clerk renders an email field; fill it and continue
  await page.locator('input[name="identifier"], input[type="email"]').first().fill(TEST_EMAIL);
  await page.locator('button[type="submit"]').click();

  // After identifier step, Clerk shows a password field
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait until we are redirected away from the sign-in flow
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 20000,
  });
}

test.describe("Funnel edit + publish", () => {
  test.beforeEach(() => {
    if (MISSING_AUTH) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_TEST_USER_EMAIL and PLAYWRIGHT_TEST_USER_PASSWORD to enable this test."
      );
    }
    if (MISSING_SLUG) {
      test.fixme(
        true,
        "Set PLAYWRIGHT_FIXTURE_FUNNEL_SLUG to a funnel owned by the test user."
      );
    }
  });

  test("authenticated user can reach the dashboard", async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");

    // Dashboard renders funnel cards or an empty state — either way no error
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
  });

  test("funnel config save + publish round-trip via API", async ({ page, request }) => {
    await signIn(page);

    // Use the API directly to read the current funnel
    const listRes = await page.request.get(`${BASE_URL}/api/funnels`);
    expect(listRes.ok()).toBeTruthy();
    const { funnels } = await listRes.json();

    type TestFunnel = {
      slug: string;
      id: string;
      config: Record<string, unknown> & { brand: { name: string }; quiz?: Record<string, unknown> };
    };
    const targetFunnel = (funnels as TestFunnel[]).find((f) => f.slug === FUNNEL_SLUG);

    if (!targetFunnel) {
      test.fixme(
        true,
        `Funnel with slug "${FUNNEL_SLUG}" not found for the test user. Check PLAYWRIGHT_FIXTURE_FUNNEL_SLUG.`
      );
      return;
    }

    const funnelId = targetFunnel.id;
    const originalName = targetFunnel.config?.brand?.name ?? "Original Name";
    const updatedName = `E2E Updated ${Date.now()}`;

    // PATCH the config with an updated headline/brand name
    const updatedConfig = {
      ...targetFunnel.config,
      brand: {
        ...targetFunnel.config.brand,
        name: updatedName,
      },
      quiz: {
        ...(targetFunnel.config.quiz ?? {}),
      },
    };

    const patchRes = await page.request.patch(`${BASE_URL}/api/funnels/${funnelId}`, {
      data: { config: updatedConfig },
    });
    expect(patchRes.ok()).toBeTruthy();

    // Publish the funnel
    const publishRes = await page.request.post(
      `${BASE_URL}/api/funnels/${funnelId}/publish`,
      { data: {} }
    );
    expect(publishRes.ok()).toBeTruthy();

    // Verify the update appears on the public URL
    await page.goto(`${BASE_URL}/f/${FUNNEL_SLUG}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(updatedName, { timeout: 15000 });

    // Restore original name to avoid polluting the fixture funnel
    const restoreConfig = {
      ...updatedConfig,
      brand: { ...updatedConfig.brand, name: originalName },
    };
    await page.request.patch(`${BASE_URL}/api/funnels/${funnelId}`, {
      data: { config: restoreConfig },
    });
    await page.request.post(`${BASE_URL}/api/funnels/${funnelId}/publish`, {
      data: {},
    });
  });
});
