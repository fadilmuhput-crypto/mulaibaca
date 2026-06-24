# Automation Testing — mulaibaca

Run automated functional tests with Playwright. Use this before every deploy to catch regressions.

## Setup (first time only)

```bash
npx playwright install chromium
```

For authenticated tests, add to `.env.local`:
```
TEST_EMAIL=your-test-account@email.com
TEST_PASSWORD=your-test-password
TEST_REVIEW_SLUG=some-existing-review-slug
```

## Running tests

**All tests (public pages only — no env needed):**
```bash
npm test
```

**All tests including auth flows:**
```bash
TEST_EMAIL=xxx TEST_PASSWORD=yyy npm test
```

**Run a specific file:**
```bash
npx playwright test tests/public-pages.spec.ts
```

**With visual browser (debug mode):**
```bash
npx playwright test --headed
```

**Show HTML report after run:**
```bash
npx playwright show-report tests/report
```

## What is tested

| File | Coverage |
|------|----------|
| `tests/public-pages.spec.ts` | Landing, /daftar form, /masuk form, /bergabung form, auth redirects |
| `tests/auth-flow.spec.ts` | Dashboard, shelf tabs, Mulai Baca button, Tulis Review button |
| `tests/review-flow.spec.ts` | Review form validation, public review page, 404 handling |

## Critical flows to verify before deploy

1. **Registration** — `/daftar` renders, has all 3 fields, links to /bergabung
2. **Auth redirects** — `/dashboard`, `/rak`, `/review`, `/profil` all redirect to `/masuk`
3. **Invite code flow** — `/bergabung` shows code input, rejects invalid code
4. **Shelf flow** — "Mulai Baca" on want tab, "Selesai ✓" on reading tab, "Tulis Review" on done tab
5. **Review flow** — form requires stars, API saves without error, public page renders

## Fixing failures

When a test fails:

1. Read the error message and screenshot in `tests/report/`
2. Check if it's a UI change (update the test selector) or a real bug (fix the code)
3. For API failures: check `/api/review`, `/api/shelf/[id]` route handlers
4. Re-run the failing test in headed mode: `npx playwright test --headed -g "test name"`
5. Fix the code, confirm test passes, then proceed with deploy

## Pre-deploy checklist

```bash
# 1. Run full test suite
npm test

# 2. Build check (catches TypeScript errors)
npm run build

# 3. If all pass → deploy
```
