import { expect, test } from "@playwright/test";

// /recipes serves a searchable list of <a href="/recipes/[slug]"> rows. The
// recipe detail view lives in the (admin) shell and is reached by a known slug.
const KNOWN_SLUG = "gateau-au-chocolat";

test.describe("Public recipe browsing", () => {
  test("admin recipes page loads with recipe rows", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
    await expect(page.locator('main a[href^="/recipes/"]:not([href$="/new"])').first()).toBeVisible();
  });

  test("search filters the list by title or ingredient", async ({ page }) => {
    await page.goto("/recipes");
    const rows = page.locator('main ul a[href^="/recipes/"]');
    await expect(rows.first()).toBeVisible();
    await page.getByRole("searchbox", { name: /search recipes/i }).fill("zzzxqj-no-match");
    await expect(page.getByText(/No recipes match/)).toBeVisible();
    await expect(rows).toHaveCount(0);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(rows.first()).toBeVisible();
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

    // RecipeClientContent renders these sections. Below md only one panel shows at a time.
    await expect(
      page.getByRole("heading", { name: /ingredients/i })
    ).toBeVisible();
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) await page.getByRole("tab", { name: /steps/i }).click();
    await expect(
      page.getByRole("heading", { name: /steps/i })
    ).toBeVisible();
  });

  test("navigating to a non-existent recipe shows not-found page", async ({
    page,
  }) => {
    await page.goto("/recipes/this-recipe-does-not-exist-xyz-999");
    await expect(
      page.getByRole("heading", { name: /not found/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("flan page: Log a flan button is reachable on mobile", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1280;
    test.skip(width >= 768, "mobile-only regression guard (vaul aria-hidden patch)");
    await page.goto("/flan");
    const button = page.getByRole("button", { name: "Log a flan" });
    await expect(button).toBeVisible();
    await expect(button.locator("xpath=ancestor-or-self::*[@aria-hidden='true']")).toHaveCount(0);
    await button.focus();
    await expect(button).toBeFocused();
  });
});
