import { expect, type Page } from "@playwright/test";

/** Creates a minimal recipe through the UI form and waits for its detail page. */
export async function createRecipeViaUi(page: Page, title: string): Promise<string> {
  await page.goto("/recipes/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Step 1", { exact: true }).fill("Mix everything.");
  await page.getByRole("button", { name: "Create recipe" }).first().click();
  await page.waitForURL(/\/recipes\/e2e-[^/?]+/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  return new URL(page.url()).pathname.split("/").pop()!;
}
