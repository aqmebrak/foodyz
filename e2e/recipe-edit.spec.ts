import { test, expect } from "@playwright/test";

test.describe("Recipe edit form", () => {
  async function goToFirstRecipeEdit(
    page: Parameters<Parameters<typeof test>[1]>[0]
  ) {
    await page.goto("/admin/recipes");
    // Click the title link in the first data row
    await page.getByRole("row").nth(1).getByRole("link").first().click();
    await page.waitForURL(/\/admin\/recipes\/.+/);
  }

  test("pre-fills title and slug from existing recipe", async ({ page }) => {
    await goToFirstRecipeEdit(page);
    await expect(page.getByLabel("Title")).not.toHaveValue("");
    await expect(page.getByLabel("Slug")).not.toHaveValue("");
  });

  test("pre-fills numeric fields with positive values", async ({ page }) => {
    await goToFirstRecipeEdit(page);

    const prep = await page.getByLabel("Prep time (min)").inputValue();
    const cook = await page.getByLabel("Cook time (min)").inputValue();
    const srv = await page.getByLabel("Servings").inputValue();

    expect(Number(prep)).toBeGreaterThan(0);
    expect(Number(cook)).toBeGreaterThanOrEqual(0);
    expect(Number(srv)).toBeGreaterThan(0);
  });

  test("slug does NOT auto-update when title changes in edit mode", async ({
    page,
  }) => {
    await goToFirstRecipeEdit(page);

    const slugInput = page.getByLabel("Slug");
    const originalSlug = await slugInput.inputValue();

    await page.getByLabel("Title").fill("Completely Different Title");

    // Slug must stay unchanged — auto-slug is disabled in edit mode
    await expect(slugInput).toHaveValue(originalSlug);
  });

  test("shows Save changes button (not Create recipe)", async ({ page }) => {
    await goToFirstRecipeEdit(page);
    await expect(
      page.getByRole("button", { name: "Save changes" }).first()
    ).toBeVisible();
  });

  test("saves description change without errors", async ({ page }) => {
    await goToFirstRecipeEdit(page);

    await page
      .getByLabel("Description")
      .fill(`Updated at ${new Date().toISOString()}`);
    await page.getByRole("button", { name: "Save changes" }).first().click();

    // No server error banner should appear
    await expect(page.getByText(/failed to/i)).not.toBeVisible({
      timeout: 5_000,
    });
    // Page stays on the edit route
    await expect(page).toHaveURL(/\/admin\/recipes\/.+/);
  });

  test("shows ingredient rows pre-populated", async ({ page }) => {
    await goToFirstRecipeEdit(page);
    // pasta-carbonara has 5 ingredients seeded
    const count = await page.getByPlaceholder("Qty").count();
    expect(count).toBeGreaterThan(0);
  });

  test("can add a new ingredient row", async ({ page }) => {
    await goToFirstRecipeEdit(page);

    const before = await page.getByPlaceholder("Qty").count();
    await page.getByRole("button", { name: "Add ingredient" }).click();
    const after = await page.getByPlaceholder("Qty").count();

    expect(after).toBe(before + 1);
  });
});
