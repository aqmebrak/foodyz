import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Covers the FlanFan sideproject (Plan.md Phase 19): admin CRUD for Flan +
// PastryLocation, and the public /flan map with its search/rating/tried
// filters. Tests run in order within this file (no parallelism configured)
// and share one flan created in the first test, matching the style of
// recipe-edit.spec.ts.
//
// There is no "delete location" UI (locations are reused across flans), so the
// created PastryLocation is removed directly via Prisma in afterAll. The flan
// delete is also swept there in case the UI delete test fails midway.

const runId = Date.now();
const uniqueName = `E2E Flan ${runId}`;
const locationName = `E2E Pastry Shop ${runId}`;
const mapsUrl = "https://maps.google.com/?q=45.75,4.85";

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.flan.deleteMany({ where: { name: uniqueName } });
  await db.pastryLocation.deleteMany({ where: { name: locationName } });
  await db.$disconnect();
});

test.describe("Flan admin CRUD", () => {
  test("creates a new pastry location and flan", async ({ page }) => {
    await page.goto("/flans");
    await page.getByRole("button", { name: "New flan" }).click();

    await page.getByPlaceholder("Flan parisien, Flan pistache…").fill(uniqueName);

    // Open the location combobox and create a new location inline
    await page.getByText("Select location…").click();
    await page.getByRole("button", { name: "New location" }).click();
    await page.getByPlaceholder("Pastry shop name").fill(locationName);
    await page.getByPlaceholder(/google\.com\/maps/).fill(mapsUrl);
    await page.getByRole("button", { name: "Create" }).click();

    // Location combobox should now show the newly created location
    await expect(page.getByText(locationName)).toBeVisible();

    // Mark as tried with a rating
    await page.getByLabel("Tried").check();
    await page.locator('input[type="date"]').fill("2026-01-15");

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("heading", { name: uniqueName })).toBeVisible();
    await expect(page.getByText(locationName)).toBeVisible();
  });

  test("new flan appears on the public /flan map and list", async ({ page }) => {
    await page.goto("/flan");
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test("search filters the flan list by name", async ({ page }) => {
    await page.goto("/flan");
    await page.getByPlaceholder("Search by name or location…").fill(uniqueName);
    await expect(page.getByText(uniqueName)).toBeVisible();

    await page.getByPlaceholder("Search by name or location…").fill("zzz-no-match-zzz");
    await expect(page.getByText("No flans match your filters.")).toBeVisible();
  });

  test("'Tried only' filter keeps a tried flan visible", async ({ page }) => {
    await page.goto("/flan");
    await page.getByRole("button", { name: "Tried", exact: true }).click();
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test("edits the flan's rating and comment from the admin UI", async ({ page }) => {
    await page.goto("/flans");
    // Scope strictly to this flan's own card (data-testid="flan-row") — a
    // plain div/hasText locator would also match ancestor containers that
    // wrap *every* flan in this real, non-fixture database, risking a click
    // on a different flan's buttons.
    const row = page.getByTestId("flan-row").filter({ hasText: uniqueName });
    await expect(row).toHaveCount(1);
    await row.getByRole("button").first().click(); // pencil (edit) icon

    await expect(page.getByText(`Editing: ${uniqueName}`)).toBeVisible();
    await page.getByPlaceholder(/Texture, taste, crust/).fill("Great custard, light caramel.");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Great custard, light caramel.")).toBeVisible();
  });

  test("deletes the flan from the admin UI", async ({ page }) => {
    await page.goto("/flans");
    const row = page.getByTestId("flan-row").filter({ hasText: uniqueName });
    await expect(row).toHaveCount(1);
    await row.getByRole("button").last().click(); // trash icon

    await page.getByRole("button", { name: "Delete" }).click();
    // The dialog only closes after the Server Action (and revalidation) completes.
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.reload();
    await expect(page.getByTestId("flan-row").filter({ hasText: uniqueName })).toHaveCount(0);
  });
});
