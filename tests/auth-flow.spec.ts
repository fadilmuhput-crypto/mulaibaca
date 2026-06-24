import { test, expect, Page } from "@playwright/test";

// ─── Auth-gated flows (uses real test account from env) ────────────────────
// Requires: TEST_EMAIL and TEST_PASSWORD environment variables

const TEST_EMAIL = process.env.TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? "";

async function login(page: Page) {
  await page.goto("/masuk");
  await page.getByLabel(/Email/i).fill(TEST_EMAIL);
  await page.getByLabel(/Password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /Masuk/i }).click();
  await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
}

test.describe("Authenticated flows", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "TEST_EMAIL and TEST_PASSWORD env vars required");

  test("login → dashboard shows greeting and quick actions", async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Halo,/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Tambah Buku/i })).toBeVisible();
  });

  test("shelf page loads with tabs", async ({ page }) => {
    await login(page);
    await page.goto("/rak");
    await expect(page.getByRole("button", { name: /Dibaca/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Mau Baca/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Selesai/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /\+ Tambah/i })).toBeVisible();
  });

  test("add book search page loads", async ({ page }) => {
    await login(page);
    await page.goto("/rak/tambah");
    await expect(page.getByPlaceholder(/Cari judul/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Cari/i })).toBeVisible();
  });

  test("review page loads", async ({ page }) => {
    await login(page);
    await page.goto("/review");
    await expect(page.getByRole("heading", { name: /Review Buku/i })).toBeVisible();
  });

  test("profile page loads with form", async ({ page }) => {
    await login(page);
    await page.goto("/profil");
    await expect(page.getByRole("button", { name: /Simpan/i })).toBeVisible();
  });

  test("want tab shows Mulai Baca button", async ({ page }) => {
    await login(page);
    await page.goto("/rak");
    await page.getByRole("button", { name: /Mau Baca/i }).click();
    // If there are books in want list, each should have Mulai Baca button
    const wantItems = page.locator(".card-elevated");
    const count = await wantItems.count();
    if (count > 0) {
      await expect(wantItems.first().getByRole("button", { name: /Mulai Baca/i })).toBeVisible();
    }
  });

  test("done tab shows Tulis Review button for unreviewed books", async ({ page }) => {
    await login(page);
    await page.goto("/rak");
    await page.getByRole("button", { name: /Selesai/i }).click();
    const doneItems = page.locator(".card-elevated");
    const count = await doneItems.count();
    if (count > 0) {
      // First item should have either "Tulis Review" or "Sudah direview"
      const hasReviewBtn = await doneItems.first().getByRole("link", { name: /Tulis Review/i }).isVisible();
      const hasReviewedBadge = await doneItems.first().getByText(/Sudah direview/i).isVisible();
      expect(hasReviewBtn || hasReviewedBadge).toBeTruthy();
    }
  });
});
