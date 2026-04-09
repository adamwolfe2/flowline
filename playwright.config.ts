import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for MyVSL E2E tests.
 *
 * Required environment variables:
 *   PLAYWRIGHT_BASE_URL            - App URL to test against (default: http://localhost:3000)
 *   PLAYWRIGHT_TEST_USER_EMAIL     - Clerk test user email
 *   PLAYWRIGHT_TEST_USER_PASSWORD  - Clerk test user password
 *   PLAYWRIGHT_FIXTURE_FUNNEL_SLUG - Slug of a published funnel for smoke tests
 *
 * Run: npm run test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // webServer block is intentionally absent.
  // In CI, spin up the app separately before running tests.
  // Locally, start `npm run dev` yourself, then run `npm run test:e2e`.
});
