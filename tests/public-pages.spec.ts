import { test, expect } from "@playwright/test";

// ─── Public pages (no auth required) ───────────────────────────────────────

test.describe("Landing page", () => {
  test("renders hero and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mulai baca.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Buat Family Space Gratis/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Lihat contoh review/i })).toBeVisible();
  });

  test("nav links resolve correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/masuk");
    await expect(page.getByRole("link", { name: /Mulai Gratis/i }).first()).toHaveAttribute("href", "/daftar");
  });
});

test.describe("Registration page (/daftar)", () => {
  test("form renders with all required fields", async ({ page }) => {
    await page.goto("/daftar");
    await expect(page.getByLabel(/Nama tampilan/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Buat Akun/i })).toBeVisible();
  });

  test("submit button disabled while fields are empty", async ({ page }) => {
    await page.goto("/daftar");
    // Button is intentionally disabled until all fields are filled
    await expect(page.getByRole("button", { name: /Buat Akun/i })).toBeDisabled();
  });

  test("submit button enables once fields are filled", async ({ page }) => {
    await page.goto("/daftar");
    await page.getByLabel(/Nama tampilan/i).fill("Test User");
    await page.getByLabel(/Email/i).fill("test@example.com");
    await page.getByLabel(/Password/i).fill("password123");
    await expect(page.getByRole("button", { name: /Buat Akun/i })).toBeEnabled();
  });

  test("has link to login and join family", async ({ page }) => {
    await page.goto("/daftar");
    await expect(page.getByRole("link", { name: /Masuk/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Bergabung ke keluarga/i })).toBeVisible();
  });
});

test.describe("Login page (/masuk)", () => {
  test("form renders correctly", async ({ page }) => {
    await page.goto("/masuk");
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Masuk/i })).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByLabel(/Email/i).fill("invalid@test.com");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /Masuk/i }).click();
    // Should show an error message, not navigate away
    await expect(page.getByRole("alert").or(page.locator("[role=status]")).or(page.locator(".bg-error-soft"))).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Join family page (/bergabung)", () => {
  test("invite code form renders", async ({ page }) => {
    await page.goto("/bergabung");
    await expect(page.getByPlaceholder(/KODE8KAR/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Lanjut/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Buat keluarga baru/i })).toBeVisible();
  });

  test("Lanjut advances to step 2 with valid length code", async ({ page }) => {
    await page.goto("/bergabung");
    await page.getByPlaceholder(/KODE8KAR/i).fill("INVALI1");
    await page.getByRole("button", { name: /Lanjut/i }).click();
    // Step 2 form fields should appear after clicking Lanjut
    await expect(page.getByLabel(/Nama tampilan/i)).toBeVisible({ timeout: 3000 });
  });

  test("shows error on invalid invite code after step 2 submit", async ({ page }) => {
    await page.goto("/bergabung");
    // Step 1: enter bogus invite code
    await page.getByPlaceholder(/KODE8KAR/i).fill("BADCODE1");
    await page.getByRole("button", { name: /Lanjut/i }).click();
    // Step 2: fill in registration details
    await page.getByLabel(/Nama tampilan/i).fill("Test User");
    await page.getByLabel(/Email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByLabel(/Password/i).fill("password123");
    // Submit — API should reject the invalid invite code
    await page.getByRole("button", { name: /Buat Akun|Bergabung/i }).click();
    // Use the specific error class to avoid matching Next.js's route announcer
    await expect(page.locator(".bg-error-soft[role='alert']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".bg-error-soft[role='alert']")).toContainText(/tidak valid|tidak ditemukan|gagal/i);
  });
});

test.describe("Auth redirects", () => {
  test("/dashboard redirects to /masuk when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/masuk");
  });

  test("/rak redirects to /masuk when not authenticated", async ({ page }) => {
    await page.goto("/rak");
    await expect(page).toHaveURL("/masuk");
  });

  test("/review redirects to /masuk when not authenticated", async ({ page }) => {
    await page.goto("/review");
    await expect(page).toHaveURL("/masuk");
  });

  test("/profil redirects to /masuk when not authenticated", async ({ page }) => {
    await page.goto("/profil");
    await expect(page).toHaveURL("/masuk");
  });
});
