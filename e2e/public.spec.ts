import { expect, test } from "@playwright/test";

// The (public) route group's grid/browse page was removed in the
// private-app-unified-recipes pivot — /recipes now serves the admin CRUD
// table (client-side row clicks, no <a href> per row). The only surviving
// (public)-layout page is the recipe detail view, reached by a known slug
// (e.g. shared via the admin "View on site" link) rather than by browsing.
const KNOWN_SLUG = "gateau-au-chocolat";

test.describe("Public recipe browsing", () => {
  test("admin recipes page loads with recipe rows", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
    // Header row + at least one data row
    await expect(page.getByRole("row").nth(1)).toBeVisible();
  });

  test("recipe detail page renders", async ({ page }) => {
    await page.goto(`/recipes/${KNOWN_SLUG}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("recipe detail page shows metadata stats", async ({ page }) => {
    await page.goto(`/recipes/${KNOWN_SLUG}`);

    // Stats grid always shows servings and a difficulty badge; Prep/Cook are
    // conditionally rendered only when the recipe has a nonzero time.
    await expect(page.getByText(/servings$/).first()).toBeVisible();
    await expect(page.getByText(/^(Easy|Medium|Hard)$/)).toBeVisible();
  });

  test("recipe detail page shows ingredients and steps", async ({ page }) => {
    await page.goto(`/recipes/${KNOWN_SLUG}`);

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
    await expect(
      page.getByText(/not found/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});
