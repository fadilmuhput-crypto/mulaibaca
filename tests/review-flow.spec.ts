import { test, expect, Page } from "@playwright/test";

// ─── Review flow tests ─────────────────────────────────────────────────────

async function login(page: Page) {
  const email = process.env.TEST_EMAIL ?? "";
  const password = process.env.TEST_PASSWORD ?? "";
  await page.goto("/masuk");
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password/i).fill(password);
  await page.getByRole("button", { name: /Masuk/i }).click();
  await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
}

test.describe("Review write form (/review/tulis)", () => {
  test.skip(!process.env.TEST_EMAIL, "TEST_EMAIL required");

  test("requires a shelf item param — redirects without it", async ({ page }) => {
    await login(page);
    await page.goto("/review/tulis");
    // Should redirect to /review if no shelf param
    await expect(page).toHaveURL("/review", { timeout: 5000 });
  });

  test("form shows star rating and submit button", async ({ page }) => {
    await login(page);
    // Navigate via the review page — pick first unreviewed book if available
    await page.goto("/review");
    const tulisBtn = page.getByRole("link", { name: /Tulis/i }).first();
    if (await tulisBtn.isVisible()) {
      await tulisBtn.click();
      await expect(page.getByText(/Berapa bintang/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Publikasikan Review/i })).toBeVisible();
    }
  });

  test("submit requires star rating", async ({ page }) => {
    await login(page);
    await page.goto("/review");
    const tulisBtn = page.getByRole("link", { name: /Tulis/i }).first();
    if (await tulisBtn.isVisible()) {
      await tulisBtn.click();
      // Try to submit without selecting stars
      await page.getByRole("button", { name: /Publikasikan Review/i }).click();
      await expect(page.getByText(/Pilih rating bintang/i)).toBeVisible();
    }
  });
});

test.describe("Public review page (/review/[slug])", () => {
  test("404 for nonexistent slug", async ({ page }) => {
    await page.goto("/review/nonexistent-slug-xyz999");
    await expect(page).toHaveURL("/review/nonexistent-slug-xyz999");
    // Should show 404 — Next.js notFound()
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

  // This test uses a known public review URL if provided via env
  test("renders review content when slug exists", async ({ page }) => {
    const slug = process.env.TEST_REVIEW_SLUG;
    test.skip(!slug, "TEST_REVIEW_SLUG env var required");
    await page.goto(`/review/${slug}`);
    // Should show book title, rating stars, and Mulai Gratis CTA
    await expect(page.getByRole("link", { name: /Mulai Gratis/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Buat Ruang Keluarga Gratis/i })).toBeVisible();
  });
});
