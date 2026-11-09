import { expect,test } from "@playwright/test";

test.describe("Recipe creation form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/new");
  });

  test("auto-generates slug from title", async ({ page }) => {
    await page.getByLabel("Title").fill("My Awesome Recipe");
    await page.locator("summary", { hasText: "Advanced" }).click();
    await expect(page.getByLabel("Slug")).toHaveValue("my-awesome-recipe");
  });

  test("slug updates live as title changes", async ({ page }) => {
    const title = page.getByLabel("Title");
    await page.locator("summary", { hasText: "Advanced" }).click();
    const slug = page.getByLabel("Slug");

    await title.fill("First Title");
    await expect(slug).toHaveValue("first-title");

    await title.fill("Second Title Here");
    await expect(slug).toHaveValue("second-title-here");
  });

  test("shows validation error when instructions are empty", async ({
    page,
  }) => {
    await page.getByLabel("Title").fill("No Instructions Recipe");
    await page.getByRole("button", { name: "Create recipe" }).first().click();
    await expect(page.getByText("Instructions are required")).toBeVisible();
  });

  test("creates a recipe successfully and redirects to its detail page", async ({
    page,
  }) => {
    const uniqueTitle = `E2E Recipe ${Date.now()}`;

    await page.getByLabel("Title").fill(uniqueTitle);
    await page.getByLabel("Description").fill("Created by Playwright E2E test.");

    await page.getByLabel("Prep time", { exact: true }).fill("10");
    await page.getByLabel("Cook time", { exact: true }).fill("20");
    await page.getByLabel("Servings", { exact: true }).fill("2");

    // Steps editor: one textarea per step ("Step N"); a blank line splits on blur
    await page
      .getByLabel("Step 1", { exact: true })
      .fill("Step 1: Boil water.\n\nStep 2: Add pasta.\n\nStep 3: Serve.");

    // Add one ingredient — combobox auto-opens after clicking "Add ingredient"
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await page.getByRole("option").first().click();
    await page.getByPlaceholder("Qty").last().fill("100");

    await page.getByRole("button", { name: "Create recipe" }).first().click();

    await page.waitForURL(/\/recipes\/e2e-recipe-\d+$/);
    await expect(page.getByRole("heading", { name: uniqueTitle })).toBeVisible();
  });

  test("add and remove ingredient row", async ({ page }) => {
    await page.getByRole("button", { name: "Add ingredient" }).click();
    // The combobox auto-opens and its z-50 dropdown extends over the button —
    // dismiss it by clicking the page heading before the second click
    await page.getByRole("heading", { name: "New recipe" }).click();
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await page.getByRole("heading", { name: "New recipe" }).click();

    // Use retrying assertion — React re-render may not be done instantly
    await expect(page.getByPlaceholder("Qty")).toHaveCount(2);

    // Remove first row via its aria-labelled button
    await page
      .getByRole("button", { name: "Remove ingredient" })
      .first()
      .click();
    await expect(page.getByPlaceholder("Qty")).toHaveCount(1);
  });
});
