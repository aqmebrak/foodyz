import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const runId = Date.now();
const fullTitle = `E2E Full Recipe ${runId}`;
const newIngredient = `E2E Ingredient ${runId}`;
const newTag = `e2e-tag-${runId}`;

test.afterAll(async () => {
  // Ingredients/tags created inline have no delete path that is safe to rely on in the UI.
  const db = new PrismaClient();
  await db.recipe.deleteMany({
    where: { OR: [{ title: fullTitle }, { title: { startsWith: "E2E Recipe " } }] },
  });
  await db.ingredient.deleteMany({ where: { name: newIngredient } });
  await db.tag.deleteMany({ where: { name: newTag } });
  await db.$disconnect();
});

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

test.describe("Recipe creation: full flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recipes/new");
  });

  test("creates a recipe with a new inline ingredient, an existing one, a tag and times", async ({
    page,
  }) => {
    await page.getByLabel("Title").fill(fullTitle);
    await page.getByLabel("Prep time", { exact: true }).fill("10");
    await page.getByLabel("Cook time", { exact: true }).fill("20");
    await page.getByLabel("Step 1", { exact: true }).fill("Mix everything.");

    // Ingredient 1: created inline through the combobox
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await page.getByRole("button", { name: "New ingredient" }).click();
    await page.getByLabel("New ingredient name").fill(newIngredient);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page.getByRole("button", { name: newIngredient })).toBeVisible();
    await page.getByPlaceholder("Qty").first().fill("2");

    // Ingredient 2: existing seeded one
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await page.getByRole("option", { name: "farine", exact: true }).click();
    await page.getByPlaceholder("Qty").last().fill("150");

    // Tag created on the fly
    await page.getByPlaceholder("Add or create tags…").fill(newTag);
    await page.getByPlaceholder("Add or create tags…").press("Enter");
    await expect(page.getByRole("button", { name: `Remove tag ${newTag}` })).toBeVisible();

    await page.getByRole("button", { name: "Create recipe" }).first().click();
    await page.waitForURL(/\/recipes\/e2e-full-recipe-\d+/);

    await expect(page.getByRole("heading", { name: fullTitle })).toBeVisible();
    await expect(page.getByText("Prep 10min")).toBeVisible();
    await expect(page.getByText("Cook 20min")).toBeVisible();
    await expect(page.getByText(newTag, { exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: new RegExp(newIngredient) })).toContainText("2");
    await expect(page.getByRole("checkbox", { name: /farine/ })).toContainText("150");
  });

  test("paste sheet turns pasted lines into ingredient rows", async ({ page }) => {
    await page.getByRole("button", { name: "Paste a list" }).click();
    await page.getByLabel("Ingredient list").fill("200 g farine\n100 g sucre");

    const preview = page.getByRole("list", { name: "Preview" });
    await expect(preview.getByRole("listitem")).toHaveCount(2);
    await expect(preview).toContainText("farine");
    await expect(preview).toContainText("sucre");

    await page.getByRole("button", { name: "Add 2 ingredients" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    await expect(page.getByPlaceholder("Qty")).toHaveCount(2);
    await expect(page.getByPlaceholder("Qty").first()).toHaveValue("200");
    await expect(page.getByPlaceholder("Qty").last()).toHaveValue("100");
    await expect(page.getByRole("button", { name: "farine" })).toBeVisible();
    await expect(page.getByRole("button", { name: "sucre" })).toBeVisible();
  });

  test.describe("draft autosave", () => {
    const draftKey = "recipe-draft-new";
    const readDraft = (page: import("@playwright/test").Page) =>
      page.evaluate((k) => localStorage.getItem(k), draftKey);

    test("restores an autosaved draft after reload", async ({ page }) => {
      page.on("dialog", (d) => d.accept()); // beforeunload guard
      await page.getByLabel("Title").fill("E2E Draft Restore");
      await expect.poll(() => readDraft(page)).not.toBeNull();

      await page.reload();
      await expect(page.getByText(/You have an unsaved draft/)).toBeVisible();
      await page.getByRole("button", { name: "Restore" }).click();
      await expect(page.getByLabel("Title")).toHaveValue("E2E Draft Restore");
      await expect(page.getByText(/You have an unsaved draft/)).toBeHidden();
    });

    test("discarding a draft removes it", async ({ page }) => {
      page.on("dialog", (d) => d.accept());
      await page.getByLabel("Title").fill("E2E Draft Discard");
      await expect.poll(() => readDraft(page)).not.toBeNull();

      await page.reload();
      await page.getByRole("button", { name: "Discard" }).click();
      await expect(page.getByText(/You have an unsaved draft/)).toBeHidden();
      await expect(page.getByLabel("Title")).toHaveValue("");
      expect(await readDraft(page)).toBeNull();

      await page.reload();
      await expect(page.getByLabel("Title")).toBeVisible();
      await expect(page.getByText(/You have an unsaved draft/)).toBeHidden();
    });
  });
});
