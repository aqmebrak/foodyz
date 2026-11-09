import { expect, type Page, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Categories, ingredients and units share the same CRUD table pattern.
// Each test creates its own uniquely named row and deletes it through the UI;
// afterAll is a safety net for rows left behind by a failed run.

const runId = Date.now();
const prefix = "E2E Lookup";
const abbr = `e2e${runId}`; // unit abbreviation (max 20 chars)

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.category.deleteMany({ where: { name: { startsWith: prefix } } });
  await db.ingredient.deleteMany({ where: { name: { startsWith: prefix } } });
  await db.unit.deleteMany({ where: { name: { startsWith: prefix } } });
  await db.$disconnect();
});

const row = (page: Page, name: string) => page.getByRole("row").filter({ hasText: name });

async function deleteRow(page: Page, name: string) {
  await row(page, name).getByRole("button").last().click(); // trash icon
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(row(page, name)).toHaveCount(0);
}

async function rename(page: Page, from: string, to: string) {
  await row(page, from).getByRole("button").first().click(); // pencil icon
  await page.getByLabel("Name").fill(to);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(row(page, to)).toHaveCount(1);
  await expect(row(page, from)).toHaveCount(0);
  await page.reload();
  await expect(row(page, to)).toHaveCount(1);
}

/** Submits the open create form and waits for the Server Action round trip. */
async function submitAndWait(page: Page, buttonName: string) {
  const done = page.waitForResponse((r) => r.request().method() === "POST");
  await page.getByRole("button", { name: buttonName }).click();
  await done;
}

test.describe("Categories", () => {
  const name = `${prefix} Category ${runId}`;
  const renamed = `${prefix} Category Renamed ${runId}`;

  test("creates, renames and deletes a category", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("button", { name: "New category" }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Description").fill("Created by Playwright");
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(row(page, name)).toHaveCount(1);

    await page.reload();
    await expect(row(page, name)).toContainText("Created by Playwright");

    await rename(page, name, renamed);
    await deleteRow(page, renamed);
  });

  test("a duplicate slug is rejected and not created twice", async ({ page }) => {
    const dup = `${prefix} Category Dup ${runId}`;
    await page.goto("/categories");
    await page.getByRole("button", { name: "New category" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(row(page, dup)).toHaveCount(1);

    await page.getByRole("button", { name: "New category" }).click();
    await page.getByLabel("Name").fill(dup);
    await submitAndWait(page, "Create category");
    await page.reload();
    await expect(row(page, dup)).toHaveCount(1);

    await deleteRow(page, dup);
  });

  // Server errors from the action must surface in the form.
  test("a duplicate slug shows an error message", async ({ page }) => {
    const dup = `${prefix} Category Msg ${runId}`;
    await page.goto("/categories");
    await page.getByRole("button", { name: "New category" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(row(page, dup)).toHaveCount(1);
    await page.getByRole("button", { name: "New category" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByText(/may already exist|already be taken/)).toBeVisible();
  });
});

test.describe("Ingredients", () => {
  const name = `${prefix} Ingredient ${runId}`;
  const renamed = `${prefix} Ingredient Renamed ${runId}`;

  test("creates, renames and deletes an ingredient", async ({ page }) => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "New ingredient" }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Create ingredient" }).click();
    await expect(row(page, name)).toHaveCount(1);

    await rename(page, name, renamed);
    await deleteRow(page, renamed);
  });

  test("a duplicate ingredient is rejected and not created twice", async ({ page }) => {
    const dup = `${prefix} Ingredient Dup ${runId}`;
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "New ingredient" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByRole("button", { name: "Create ingredient" }).click();
    await expect(row(page, dup)).toHaveCount(1);

    await page.getByRole("button", { name: "New ingredient" }).click();
    await page.getByLabel("Name").fill(dup);
    await submitAndWait(page, "Create ingredient");
    await page.reload();
    await expect(row(page, dup)).toHaveCount(1);

    await deleteRow(page, dup);
  });
});

test.describe("Units", () => {
  const name = `${prefix} Unit ${runId}`;
  const renamed = `${prefix} Unit Renamed ${runId}`;

  test("creates, renames and deletes a unit", async ({ page }) => {
    await page.goto("/units");
    await page.getByRole("button", { name: "New unit" }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Abbreviation").fill(abbr);
    await page.getByRole("button", { name: "Create unit" }).click();
    await expect(row(page, name)).toHaveCount(1);
    await expect(row(page, name)).toContainText(abbr);

    await rename(page, name, renamed);
    await deleteRow(page, renamed);
  });

  test("a duplicate unit is rejected and not created twice", async ({ page }) => {
    const dup = `${prefix} Unit Dup ${runId}`;
    await page.goto("/units");
    await page.getByRole("button", { name: "New unit" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByLabel("Abbreviation").fill(`${abbr}d`);
    await page.getByRole("button", { name: "Create unit" }).click();
    await expect(row(page, dup)).toHaveCount(1);

    await page.getByRole("button", { name: "New unit" }).click();
    await page.getByLabel("Name").fill(dup);
    await page.getByLabel("Abbreviation").fill(`${abbr}d`);
    await submitAndWait(page, "Create unit");
    await page.reload();
    await expect(row(page, dup)).toHaveCount(1);

    await deleteRow(page, dup);
  });
});
