import { expect,test } from "@playwright/test";

test.describe("Recipe creation form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/recipes/new");
  });

  test("auto-generates slug from title", async ({ page }) => {
    await page.getByLabel("Title").fill("My Awesome Recipe");
    await expect(page.getByLabel("Slug")).toHaveValue("my-awesome-recipe");
  });

  test("slug updates live as title changes", async ({ page }) => {
    const title = page.getByLabel("Title");
    const slug = page.getByLabel("Slug");

    await title.fill("First Title");
    await expect(slug).toHaveValue("first-title");

    await title.fill("Second Title Here");
    await expect(slug).toHaveValue("second-title-here");
  });

  test("shows validation error when category is not selected", async ({
    page,
  }) => {
    await page.getByLabel("Title").fill("Incomplete Recipe");
    // Instructions textarea has no FormLabel — use placeholder
    await page.getByPlaceholder(/Describe each step/).fill("Some instructions.");
    await page.getByRole("button", { name: "Create recipe" }).first().click();
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test("shows validation error when instructions are empty", async ({
    page,
  }) => {
    await page.getByLabel("Title").fill("No Instructions Recipe");
    // Category select: FormLabel "Category" is associated via htmlFor/id
    await page.getByLabel("Category").click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "Create recipe" }).first().click();
    await expect(page.getByText("Instructions are required")).toBeVisible();
  });

  test("creates a recipe successfully and redirects to list", async ({
    page,
  }) => {
    const uniqueTitle = `E2E Recipe ${Date.now()}`;

    await page.getByLabel("Title").fill(uniqueTitle);
    await page.getByLabel("Description").fill("Created by Playwright E2E test.");

    // Category (index 0 among [data-slot="select-trigger"])
    await page.getByLabel("Category").click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Prep time (min)").fill("10");
    await page.getByLabel("Cook time (min)").fill("20");
    await page.getByLabel("Servings").fill("2");

    await page
      .getByPlaceholder(/Describe each step/)
      .fill("Step 1: Boil water.\n\nStep 2: Add pasta.\n\nStep 3: Serve.");

    // Add one ingredient — combobox auto-opens after clicking "Add ingredient"
    await page.getByRole("button", { name: "Add ingredient" }).click();
    // Ingredient options are <button> elements containing a check icon (lucide-check)
    await page.locator("button:has(svg.lucide-check)").first().click();
    await page.getByPlaceholder("Qty").fill("100");

    await page.getByRole("button", { name: "Create recipe" }).first().click();

    await page.waitForURL(/\/admin\/recipes$/);
    await expect(page.getByText(uniqueTitle)).toBeVisible();
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
