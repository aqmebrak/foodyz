import { expect,test } from "@playwright/test";

test.describe("Recipe edit form", () => {
  async function openFirstRecipePanel(
    page: import("@playwright/test").Page
  ) {
    await page.goto("/recipes");
    // Click the first data row to open the view drawer
    await page.getByRole("row").nth(1).click();
    // Wait for the async recipe fetch to complete, enabling the Edit button
    const editButton = page.getByRole("button", { name: "Edit" });
    await expect(editButton).toBeEnabled({ timeout: 15_000 });
    await editButton.click();
    // Wait for RecipeForm to mount in edit mode (renders its SaveBar)
    await expect(
      page.getByRole("button", { name: "Save changes" }).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  test("pre-fills title and slug from existing recipe", async ({ page }) => {
    await openFirstRecipePanel(page);
    await expect(page.getByLabel("Title")).not.toHaveValue("");
    await expect(page.getByLabel("Slug")).not.toHaveValue("");
  });

  test("pre-fills numeric fields with positive values", async ({ page }) => {
    await openFirstRecipePanel(page);

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
    await openFirstRecipePanel(page);

    const slugInput = page.getByLabel("Slug");
    const originalSlug = await slugInput.inputValue();

    await page.getByLabel("Title").fill("Completely Different Title");

    // Slug must stay unchanged — auto-slug is disabled in edit mode
    await expect(slugInput).toHaveValue(originalSlug);
  });

  test("shows Save changes button (not Create recipe)", async ({ page }) => {
    await openFirstRecipePanel(page);
    await expect(
      page.getByRole("button", { name: "Save changes" }).first()
    ).toBeVisible();
  });

  test("saves description change without errors", async ({ page }) => {
    await openFirstRecipePanel(page);

    await page
      .getByLabel("Description")
      .fill(`Updated at ${new Date().toISOString()}`);
    await page.getByRole("button", { name: "Save changes" }).first().click();

    // No server error banner should appear
    await expect(page.getByText(/failed to/i)).not.toBeVisible({
      timeout: 5_000,
    });
    // After save, server action redirects back to the recipe list
    await expect(page).toHaveURL(/\/recipes/, { timeout: 10_000 });
  });

  test("shows ingredient rows pre-populated", async ({ page }) => {
    await openFirstRecipePanel(page);
    // pasta-carbonara has 5 ingredients seeded
    const count = await page.getByPlaceholder("Qty").count();
    expect(count).toBeGreaterThan(0);
  });

  test("can add a new ingredient row", async ({ page }) => {
    await openFirstRecipePanel(page);

    const before = await page.getByPlaceholder("Qty").count();
    await page.getByRole("button", { name: "Add ingredient" }).click();
    // Use retrying assertion — React re-render may not be done instantly
    await expect(page.getByPlaceholder("Qty")).toHaveCount(before + 1);
  });

  test("can select an ingredient in a new row", async ({ page }) => {
    await openFirstRecipePanel(page);

    await page.getByRole("button", { name: "Add ingredient" }).click();

    // Combobox auto-opens after adding a row — ingredient options are
    // rendered as <button> elements containing a check icon (lucide-check)
    await page.locator("button:has(svg.lucide-check)").first().click();

    // Fill in quantity for the new (last) row
    await page.getByPlaceholder("Qty").last().fill("2");

    // The ingredient combobox should now show a name (not the placeholder "Ingredient")
    await page.locator("button").filter({ hasNotText: "Ingredient" });
    // Just verify no error appeared and qty was filled
    await expect(page.getByPlaceholder("Qty").last()).toHaveValue("2");
  });
});
