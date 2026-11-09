import { expect, test } from "@playwright/test";

import { createRecipeViaUi } from "./helpers";

test.describe("Recipe deletion", () => {
  test("deletes a recipe from the list via the confirm dialog", async ({ page }) => {
    const title = `E2E Delete List ${Date.now()}`;
    await createRecipeViaUi(page, title);

    await page.goto("/recipes?drafts=1"); // new recipes are unpublished drafts
    const row = page.locator("main ul li").filter({ hasText: title });
    await expect(row).toHaveCount(1);

    await page.getByRole("button", { name: `Delete ${title}` }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Delete recipe?")).toBeVisible();
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.locator("main ul li").filter({ hasText: title })).toHaveCount(0);
  });

  test("cancel keeps the recipe", async ({ page }) => {
    const title = `E2E Delete Cancel ${Date.now()}`;
    const slug = await createRecipeViaUi(page, title);

    await page.goto("/recipes?drafts=1"); // new recipes are unpublished drafts
    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator("main ul li").filter({ hasText: title })).toHaveCount(1);

    // cleanup via the edit page
    await page.goto(`/recipes/${slug}/edit`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await page.waitForURL(/\/recipes(\?deleted=1)?$/);
  });

  // The detail page has no delete action; deletion lives on the edit page.
  test("deletes from the edit page, shows toast and recipe is gone", async ({ page }) => {
    const title = `E2E Delete Edit ${Date.now()}`;
    const slug = await createRecipeViaUi(page, title);

    await page.goto(`/recipes/${slug}/edit`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();

    await page.waitForURL(/\/recipes(\?deleted=1)?$/);
    await expect(page.getByText("Recipe deleted")).toBeVisible();

    await page.reload();
    await expect(page.locator("main ul li").filter({ hasText: title })).toHaveCount(0);
    await page.goto(`/recipes/${slug}`);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  });
});
