import { expect,test } from "@playwright/test";

test.describe("Public recipe browsing", () => {
  test("recipes page loads with published recipes", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
    // At least one recipe link should be visible
    await expect(
      page.locator("a[href^='/recipes/']").first()
    ).toBeVisible();
  });

  test("can open a recipe detail page from the list", async ({ page }) => {
    await page.goto("/recipes");
    // Click the first recipe card link
    await page.locator("a[href^='/recipes/']").first().click();
    await page.waitForURL(/\/recipes\/.+/);
    // Recipe title h1 should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("recipe detail page shows metadata stats", async ({ page }) => {
    await page.goto("/recipes");
    await page.locator("a[href^='/recipes/']").first().click();
    await page.waitForURL(/\/recipes\/.+/);

    // Stat labels from the metadata grid
    await expect(page.getByText("Prep")).toBeVisible();
    await expect(page.getByText("Cook")).toBeVisible();
    await expect(page.getByText("Serves")).toBeVisible();
    await expect(page.getByText("Level")).toBeVisible();
  });

  test("recipe detail page shows ingredients and steps", async ({ page }) => {
    await page.goto("/recipes");
    await page.locator("a[href^='/recipes/']").first().click();
    await page.waitForURL(/\/recipes\/.+/);

    // RecipeClientContent renders these sections
    await expect(
      page.getByRole("heading", { name: /ingredients/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /instructions/i })
    ).toBeVisible();
  });

  test("navigating to a non-existent recipe shows not-found page", async ({
    page,
  }) => {
    await page.goto("/recipes/this-recipe-does-not-exist-xyz-999");
    // Next.js not-found pages typically contain "not found" text
    await expect(
      page.getByText(/not found/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    // No uncaught errors — page should respond with 200
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});
