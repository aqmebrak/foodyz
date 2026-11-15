import { expect, test } from "@playwright/test";

// Public read-only flan map: must work with no session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Public flan map", () => {
  test("loads logged out", async ({ page }) => {
    await page.goto("/lyon-flans");
    await expect(page).toHaveURL(/\/lyon-flans$/);
    await expect(page.getByRole("heading", { name: /Flan tour/ })).toBeVisible();
  });

  test("has no log button", async ({ page }) => {
    await page.goto("/lyon-flans");
    await expect(page.getByRole("heading", { name: /Flan tour/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log a flan" })).toHaveCount(0);
  });

  test("is noindex", async ({ page }) => {
    await page.goto("/lyon-flans");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("private routes stay gated", async ({ page }) => {
    for (const path of ["/flan", "/recipes", "/lyon-flans-x"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
