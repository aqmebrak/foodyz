import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Shop editing view (/shops): flans are read-only, the Maps URL is editable and moves the map pin.

const runId = Date.now();
const shopName = `E2E Edit Shop ${runId}`;
const triedFlan = `E2E Tried Flan ${runId}`;
const untriedFlan = `E2E Untried Flan ${runId}`;
// Camera centre (@) ~5 km away from the real pin (!3d!4d), the shape Google shares.
const urlFor = (lat: number, lng: number) =>
  `https://www.google.com/maps/place/E2E/@45.8000,4.9000,17z/data=!3d${lat}!4d${lng}`;
const OLD_PIN: [number, number] = [45.75, 4.8];
const NEW_PIN: [number, number] = [45.77, 4.88];

const db = new PrismaClient();

test.beforeAll(async () => {
  await db.pastryLocation.create({
    data: {
      name: shopName,
      mapsUrl: urlFor(...OLD_PIN),
      flans: {
        create: [
          { name: triedFlan, tried: true, rating: 4 },
          { name: untriedFlan, tried: false, rating: 0 },
        ],
      },
    },
  });
});

test.afterAll(async () => {
  await db.flan.deleteMany({ where: { name: { in: [triedFlan, untriedFlan] } } });
  await db.pastryLocation.deleteMany({ where: { name: shopName } });
  await db.$disconnect();
});

const shopRow = (page: import("@playwright/test").Page) =>
  page.getByTestId("shop-row").filter({ hasText: shopName });

test("lists the shop with its flans, tried and not tried, read-only", async ({ page }) => {
  await page.goto("/shops");
  const row = shopRow(page);
  await expect(row).toHaveCount(1);
  await expect(row.getByRole("heading", { name: shopName })).toBeVisible();
  await expect(row.getByText("2 flans · 1 tried")).toBeVisible();

  const flans = row.getByRole("list", { name: `Flans at ${shopName}` });
  await expect(flans.getByRole("listitem").filter({ hasText: triedFlan })).toContainText("(tried)");
  await expect(flans.getByRole("listitem").filter({ hasText: untriedFlan })).toContainText("(not tried)");
  // Flans and the shop name are not editable here: the only input is the Maps URL.
  await expect(row.getByRole("textbox")).toHaveCount(1);
  await expect(row.getByLabel("Google Maps URL")).toHaveValue(urlFor(...OLD_PIN));
  await expect(row.getByTestId("shop-position")).toContainText("45.75000, 4.80000");
});

test("editing the Maps URL saves it and moves the pin on the map", async ({ page }) => {
  await page.goto("/shops");
  const row = shopRow(page);
  const save = row.getByRole("button", { name: "Save URL" });
  await expect(save).toBeDisabled();

  await row.getByLabel("Google Maps URL").fill(urlFor(...NEW_PIN));
  await expect(row.getByTestId("shop-position")).toContainText("45.77000, 4.88000");
  await save.click();
  await expect(row.getByRole("status")).toHaveText("URL saved");
  await expect(save).toBeDisabled();

  await page.reload();
  await expect(shopRow(page).getByLabel("Google Maps URL")).toHaveValue(urlFor(...NEW_PIN));

  // /flan shows only tried and to-try flans that have a location: our two flans now sit at the new pin.
  await page.goto("/flan");
  await expect(page.locator(`[data-lat="${NEW_PIN[0]}"][data-lng="${NEW_PIN[1]}"]`).first()).toBeVisible();
  await expect(page.locator(`[data-lat="${OLD_PIN[0]}"][data-lng="${OLD_PIN[1]}"]`)).toHaveCount(0);
});

test("warns when a URL has no position but still saves it", async ({ page }) => {
  await page.goto("/shops");
  const row = shopRow(page);
  await row.getByLabel("Google Maps URL").fill("https://example.com/no-coordinates");
  await expect(row.getByTestId("shop-position")).toContainText("No position found");
  await row.getByRole("button", { name: "Save URL" }).click();
  await expect(row.getByRole("status")).toHaveText("URL saved");

  // Put a valid pin back so later runs/tests start from a clean shop.
  await row.getByLabel("Google Maps URL").fill(urlFor(...OLD_PIN));
  await row.getByRole("button", { name: "Save URL" }).click();
  await expect(row.getByRole("status")).toHaveText("URL saved");
});
