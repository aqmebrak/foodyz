import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// /flan quick-log flow and map markers. Photo upload is skipped (needs Vercel Blob).
// Marker POSITION is intentionally not asserted here (Maps URL parsing is tested in unit tests).

const runId = Date.now();
const quickFlan = `E2E Quick Flan ${runId}`;
const markerFlan = `E2E Marker Flan ${runId}`;
const markerShop = `E2E Marker Shop ${runId}`;
// Real share-URL shape: the `@` camera centre is ~5 km off, the true pin is the `!3d!4d` pair.
const PIN: [string, string] = ["45.764", "4.8357"];
const mapsUrl = `https://www.google.com/maps/place/E2E/@45.8000,4.9000,17z/data=!3m1!4b1!4m6!3m5!8m2!3d${PIN[0]}!4d${PIN[1]}!16s%2Fg%2F1`;

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.flan.deleteMany({ where: { name: { in: [quickFlan, markerFlan] } } });
  await db.pastryLocation.deleteMany({ where: { name: markerShop } });
  await db.$disconnect();
});

test("quick-logs a flan from /flan and it appears in the list", async ({ page }) => {
  const db = new PrismaClient();
  const location = await db.pastryLocation.findFirstOrThrow({ orderBy: { name: "asc" } });
  await db.$disconnect();

  await page.goto("/flan");
  await page.getByRole("button", { name: "Log a flan" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByText("Log a flan")).toBeVisible();

  // Validation: saving an empty form asks for a rating first
  await sheet.getByRole("button", { name: "Save flan" }).click();
  await expect(sheet.getByRole("alert")).toHaveText("Tap a star to rate it.");

  await sheet.getByRole("radio", { name: "4 out of 5" }).click();
  await expect(sheet.getByRole("radio", { name: "4 out of 5" })).toBeChecked();

  await sheet.getByRole("button", { name: "Select location…" }).click();
  await sheet.getByPlaceholder("Search locations…").fill(location.name);
  await sheet.getByRole("button", { name: location.name, exact: true }).click();

  await sheet.getByLabel("Flan name").fill(quickFlan);
  await sheet.getByLabel("Comment").fill("Logged by Playwright");
  await sheet.getByRole("button", { name: "Save flan" }).click();

  await expect(page.getByText("Flan logged")).toBeVisible();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: new RegExp(quickFlan) })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: new RegExp(quickFlan) })).toBeVisible();
});

test("a new pastry location with a Maps URL gets a map marker", async ({ page }) => {
  const markers = page.locator(".leaflet-marker-icon");

  await page.goto("/flan");
  await expect(markers.first()).toBeVisible();
  const before = await markers.count();

  await page.goto("/flans");
  await page.getByRole("button", { name: "New flan" }).click();
  await page.getByPlaceholder("Flan parisien, Flan pistache…").fill(markerFlan);
  await page.getByText("Select location…").click();
  await page.getByRole("button", { name: "New location" }).click();
  await page.getByPlaceholder("Pastry shop name").fill(markerShop);
  await page.getByPlaceholder(/google\.com\/maps/).fill(mapsUrl);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText(markerShop)).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: markerFlan })).toBeVisible();

  await page.goto("/flan");
  await expect(markers).toHaveCount(before + 1);

  // The marker sits on the place pin (!3d!4d), not on the camera centre (@).
  await expect(page.locator(`[data-lat="${PIN[0]}"][data-lng="${PIN[1]}"]`)).toHaveCount(1);
  await expect(page.locator('[data-lat="45.8"][data-lng="4.9"]')).toHaveCount(0);
});
