# E2E Tests — MyVSL

Playwright-based end-to-end tests covering the 5 critical money-path flows.
Tests run against a live environment (local dev or staging). No mocks.

## Setup

### 1. Install dependencies (already done if you ran `npm install`)

```bash
npm install
npx playwright install --with-deps chromium
```

### 2. Configure environment variables

Create a `.env.test` file (never commit it — it is covered by `.gitignore`):

```bash
# Base URL of the app to test against. Use staging, never production.
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Clerk test-mode credentials for an account that owns at least one funnel.
PLAYWRIGHT_TEST_USER_EMAIL=your-test-user@example.com
PLAYWRIGHT_TEST_USER_PASSWORD=your-test-password

# Slug of a published funnel owned by the test user.
# Example: if your funnel URL is /f/my-coaching-funnel, set this to my-coaching-funnel
PLAYWRIGHT_FIXTURE_FUNNEL_SLUG=my-coaching-funnel
```

Load them before running:

```bash
export $(cat .env.test | xargs)
npm run test:e2e
```

Or pass inline:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_TEST_USER_EMAIL=... \
PLAYWRIGHT_TEST_USER_PASSWORD=... \
PLAYWRIGHT_FIXTURE_FUNNEL_SLUG=... \
npm run test:e2e
```

### 3. Start the app (local mode)

```bash
npm run dev
# In a separate terminal:
npm run test:e2e
```

## Test Coverage

| # | File | What it tests | Auth required |
|---|------|--------------|---------------|
| 1 | `01-public-funnel-render.spec.ts` | Public funnel loads, quiz navigable, lead capture submits | No |
| 2 | `02-funnel-edit-publish.spec.ts` | Config PATCH + publish, public URL reflects changes | Yes |
| 3 | `03-api-submit-integration.spec.ts` | /api/submit validation, duplicates, 400/404 cases | Partial |
| 4 | `04-stripe-checkout.spec.ts` | /billing page, checkout API response (configured or not) | Yes |
| 5 | `05-email-sequence-enrollment.spec.ts` | Sequence enrollment on lead submit, graceful when no sequences | Yes |

## Useful commands

```bash
# Run all E2E tests
npm run test:e2e

# Run in interactive UI mode (watch, debug, trace viewer)
npm run test:e2e:ui

# Open HTML report from last run
npm run test:e2e:report

# Run a single test file
npx playwright test tests/e2e/01-public-funnel-render.spec.ts

# Debug a failing test with inspector
npx playwright test tests/e2e/01-public-funnel-render.spec.ts --debug

# List all tests without running them
npx playwright test --list
```

## Fixture funnel setup

Several tests require a published funnel with at least 2 quiz questions.
If you do not have one:

1. Sign in at `/sign-in`
2. Go to `/dashboard`
3. Click "New Funnel" and generate one with the AI builder
4. Publish it from the builder
5. Copy the slug from the URL bar (e.g. `/f/my-coaching-funnel` → slug is `my-coaching-funnel`)
6. Set `PLAYWRIGHT_FIXTURE_FUNNEL_SLUG=my-coaching-funnel`

For automated seeding in a CI environment, see `tests/e2e/fixtures/seed.ts`.
The `createTestFunnel` helper creates and publishes a minimal funnel via the API.

## Flaky test notes

- Tests 2, 4, 5 require Clerk sign-in. Clerk's hosted UI can occasionally be slow — the default `navigationTimeout` is 30s.
- Test 4 (Stripe) will always return a 400 until the `STRIPE_*_PRICE_ID` env vars are configured in the environment being tested.
- Test 5 (sequences) requires the test user to be on Pro or Agency plan to create sequences.

## Artifacts

On test failure, Playwright saves:
- **Screenshots**: `test-results/<test-name>/`
- **Videos**: `test-results/<test-name>/`
- **Traces**: `test-results/<test-name>/trace.zip` (open with `npx playwright show-trace`)
- **HTML Report**: `playwright-report/index.html`

All artifact directories are in `.gitignore`.
