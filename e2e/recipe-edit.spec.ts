import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const runId = Date.now();
const ownTitle = `E2E Edit Recipe ${runId}`;

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.recipe.deleteMany({ where: { title: ownTitle } });
  await db.$disconnect();
});

test.describe("Recipe edit form", () => {
  // Edit now lives on its own route: /recipes/<slug>/edit
  async function openFirstRecipePanel(
    page: import("@playwright/test").Page
  ) {
    await page.goto("/recipes");
    // Desktop: clicking a list row opens the drawer; follow its Edit link.
    // Use a known seeded recipe (has prep time + ingredients) rather than list order.
    await page.getByRole("link", { name: /Gâteau au Chocolat/i }).first().click();
    const editLink = page.getByRole("link", { name: "Edit" });
    await expect(editLink).toBeVisible({ timeout: 15_000 });
    await editLink.click();
    await page.waitForURL(/\/recipes\/[^/]+\/edit$/);
    await expect(
      page.getByRole("button", { name: "Save recipe" })
    ).toBeVisible({ timeout: 15_000 });
  }

  test("pre-fills title and slug from existing recipe", async ({ page }) => {
    await openFirstRecipePanel(page);
    await expect(page.getByLabel("Title")).not.toHaveValue("");
    await page.locator("summary", { hasText: "Advanced" }).click();
    await expect(page.getByLabel("Slug")).not.toHaveValue("");
  });

  test("pre-fills numeric fields with positive values", async ({ page }) => {
    await openFirstRecipePanel(page);

    const prep = await page.getByLabel("Prep time", { exact: true }).inputValue();
    const cook = await page.getByLabel("Cook time", { exact: true }).inputValue();
    const srv = await page.getByLabel("Servings", { exact: true }).inputValue();

    expect(Number(prep)).toBeGreaterThan(0);
    expect(Number(cook)).toBeGreaterThanOrEqual(0);
    expect(Number(srv)).toBeGreaterThan(0);
  });

  test("slug does NOT auto-update when title changes in edit mode", async ({
    page,
  }) => {
    await openFirstRecipePanel(page);
    await page.locator("summary", { hasText: "Advanced" }).click();

    const slugInput = page.getByLabel("Slug");
    const originalSlug = await slugInput.inputValue();

    await page.getByLabel("Title").fill("Completely Different Title");

    // Slug must stay unchanged — auto-slug is disabled in edit mode
    await expect(slugInput).toHaveValue(originalSlug);
  });

  test("shows Save recipe button (not Create recipe)", async ({ page }) => {
    await openFirstRecipePanel(page);
    await expect(page.getByRole("button", { name: "Save recipe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create recipe" })).toHaveCount(0);
  });

  test("saves description change without errors", async ({ page }) => {
    await openFirstRecipePanel(page);

    await page
      .getByLabel("Description")
      .fill(`Updated at ${new Date().toISOString()}`);
    await page.getByRole("button", { name: "Save recipe" }).click();

    // No server error banner should appear
    await expect(page.getByText(/failed to/i)).not.toBeVisible({
      timeout: 5_000,
    });
    // After save, server action redirects to the recipe detail page
    await expect(page).toHaveURL(/\/recipes\/[^/]+$/, { timeout: 10_000 });
  });

  test("shows ingredient rows pre-populated", async ({ page }) => {
    await openFirstRecipePanel(page);
    // gateau-au-chocolat has ingredients seeded
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

    // Combobox auto-opens after adding a row
    await page.getByRole("option").first().click();

    // Fill in quantity for the new (last) row
    await page.getByPlaceholder("Qty").last().fill("2");

    await expect(page.getByPlaceholder("Qty").last()).toHaveValue("2");
  });
});

// These tests mutate a recipe of their own (created once in the first test) so the seed stays intact.
test.describe.serial("Recipe edit: ingredients and unsaved guard", () => {
  let slug = "";

  test("setup: create a recipe with three pasted ingredients", async ({ page }) => {
    await page.goto("/recipes/new");
    await page.getByLabel("Title").fill(ownTitle);
    await page.getByLabel("Step 1", { exact: true }).fill("Mix everything.");
    await page.getByRole("button", { name: "Paste a list" }).click();
    await page.getByLabel("Ingredient list").fill("200 g farine\n100 g sucre\n50 g beurre");
    await page.getByRole("button", { name: "Add 3 ingredients" }).click();
    await expect(page.getByPlaceholder("Qty")).toHaveCount(3);
    await page.getByRole("button", { name: "Create recipe" }).first().click();
    await page.waitForURL(/\/recipes\/e2e-edit-recipe-\d+/);
    slug = new URL(page.url()).pathname.split("/").pop()!;
    await expect(page.getByRole("checkbox")).toHaveCount(3);
  });

  test("removes and reorders ingredients, saves, detail reflects it", async ({ page }) => {
    await page.goto(`/recipes/${slug}/edit`);
    await expect(page.getByPlaceholder("Qty")).toHaveCount(3);

    // [farine, sucre, beurre] -> remove sucre -> [farine, beurre] -> move farine down -> [beurre, farine]
    await page.getByRole("button", { name: "Remove ingredient" }).nth(1).click();
    await expect(page.getByPlaceholder("Qty")).toHaveCount(2);
    await page.getByRole("button", { name: "Move down" }).first().click();

    await page.getByRole("button", { name: "Save recipe" }).click();
    await page.waitForURL(new RegExp(`/recipes/${slug}$`));
    await expect(page.getByText("Recipe saved")).toBeVisible();

    const items = page.getByRole("checkbox");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("beurre");
    await expect(items.nth(1)).toContainText("farine");

    // Persisted, not just client state
    await page.reload();
    await expect(page.getByRole("checkbox").nth(0)).toContainText("beurre");
    await expect(page.getByRole("checkbox")).toHaveCount(2);
  });

  test("leaving the edit page with unsaved changes asks for confirmation", async ({ page }) => {
    await page.goto(`/recipes/${slug}/edit`);
    const messages: string[] = [];
    let accept = false;
    page.on("dialog", (d) => {
      messages.push(d.message());
      return accept ? d.accept() : d.dismiss();
    });

    await page.getByLabel("Description").fill("Unsaved edit");
    await page.getByRole("link", { name: "Back to recipe" }).click();
    await expect.poll(() => messages.length).toBe(1);
    expect(messages[0]).toMatch(/unsaved changes/i);
    await expect(page).toHaveURL(new RegExp(`/recipes/${slug}/edit$`));

    accept = true;
    await page.getByRole("link", { name: "Back to recipe" }).click();
    await expect.poll(() => messages.length).toBe(2);
    await page.waitForURL(new RegExp(`/recipes/${slug}$`));
  });

  test("no confirmation when nothing was changed", async ({ page }) => {
    await page.goto(`/recipes/${slug}/edit`);
    let dialogs = 0;
    page.on("dialog", (d) => {
      dialogs++;
      return d.dismiss();
    });
    await expect(page.getByLabel("Title")).toHaveValue(ownTitle);
    await page.getByRole("link", { name: "Back to recipe" }).click();
    await page.waitForURL(new RegExp(`/recipes/${slug}$`));
    expect(dialogs).toBe(0);
  });
});
