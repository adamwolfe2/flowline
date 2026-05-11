/**
 * Debug spec: walk through the full funnel using *role-based* selectors that
 * only click quiz option buttons (not nav / progress / close buttons), and
 * captures a trace of every step.
 *
 * Pass PLAYWRIGHT_FIXTURE_FUNNEL_SLUG=<slug> to point at a published funnel.
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const FUNNEL_SLUG = process.env.PLAYWRIGHT_FIXTURE_FUNNEL_SLUG || "cursive-dmi3";

test("complete funnel walkthrough end-to-end", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto(`${BASE_URL}/f/${FUNNEL_SLUG}`);
  await page.waitForLoadState("domcontentloaded");

  // Welcome step: click any CTA button at the bottom
  const startBtn = page
    .getByRole("button")
    .filter({ hasText: /start|begin|continue|get started|next/i })
    .first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startBtn.click();
  }

  // Click through quiz: prefer buttons containing the option label text from
  // visible question content; fall back to scoring on visible question options.
  for (let i = 0; i < 8; i++) {
    // If we've reached the email step, break
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 1500 }).catch(() => false)) break;

    // Quiz option buttons are styled with min-height 56px; click first such
    // button that's not "Back". Use getByRole + filter.
    const candidate = page
      .getByRole("button")
      .filter({ hasNotText: /back|prev|close|×|skip|continue later/i })
      .first();

    const visible = await candidate.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) break;

    await candidate.click();
    // Animation delay is 500ms in handleSelect
    await page.waitForTimeout(700);
  }

  // We expect to land on the email step
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

  console.log("Reached email step. Console errors during walkthrough:");
  for (const e of consoleErrors) console.log("  ", e);
});
