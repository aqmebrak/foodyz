import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Shop editing view (/flans/shops): flans are read-only; the name and Maps URL are editable and the URL moves the map pin.

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
let shopId = "";

test.beforeAll(async () => {
  const shop = await db.pastryLocation.create({
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
  shopId = shop.id;
});

test.afterAll(async () => {
  await db.flan.deleteMany({ where: { name: { in: [triedFlan, untriedFlan] } } });
  await db.pastryLocation.deleteMany({ where: { id: shopId } });
  await db.$disconnect();
});

const shopRow = (page: import("@playwright/test").Page, name = shopName) =>
  page.getByTestId("shop-row").filter({ has: page.getByRole("heading", { name, exact: true }) });

test("lists the shop with its flans, tried and not tried, read-only", async ({ page }) => {
  await page.goto("/flans/shops");
  const row = shopRow(page);
  await expect(row).toHaveCount(1);
  await expect(row.getByRole("heading", { name: shopName })).toBeVisible();
  await expect(row.getByText("2 flans · 1 tried")).toBeVisible();

  const flans = row.getByRole("list", { name: `Flans at ${shopName}` });
  await expect(flans.getByRole("listitem").filter({ hasText: triedFlan })).toContainText("(tried)");
  await expect(flans.getByRole("listitem").filter({ hasText: untriedFlan })).toContainText("(not tried)");
  // Flans are read-only: the only editable fields are the shop name and the Maps URL.
  await expect(row.getByRole("textbox")).toHaveCount(2);
  await expect(row.getByLabel("Name", { exact: true })).toHaveValue(shopName);
  await expect(row.getByLabel("Google Maps URL")).toHaveValue(urlFor(...OLD_PIN));
  await expect(row.getByTestId("shop-position")).toContainText("45.75000, 4.80000");
});

test("editing the Maps URL saves it and moves the pin on the map", async ({ page }) => {
  await page.goto("/flans/shops");
  const row = shopRow(page);
  const save = row.getByRole("button", { name: "Save", exact: true });
  await expect(save).toBeDisabled();

  await row.getByLabel("Google Maps URL").fill(urlFor(...NEW_PIN));
  await expect(row.getByTestId("shop-position")).toContainText("45.77000, 4.88000");
  await save.click();
  await expect(row.getByRole("status")).toHaveText("Saved");
  await expect(save).toBeDisabled();

  await page.reload();
  await expect(shopRow(page).getByLabel("Google Maps URL")).toHaveValue(urlFor(...NEW_PIN));

  // /flan shows only tried and to-try flans that have a location: our two flans now sit at the new pin.
  await page.goto("/flan");
  await expect(page.locator(`[data-lat="${NEW_PIN[0]}"][data-lng="${NEW_PIN[1]}"]`).first()).toBeVisible();
  await expect(page.locator(`[data-lat="${OLD_PIN[0]}"][data-lng="${OLD_PIN[1]}"]`)).toHaveCount(0);
});

test("warns when a URL has no position but still saves it", async ({ page }) => {
  await page.goto("/flans/shops");
  const row = shopRow(page);
  await row.getByLabel("Google Maps URL").fill("https://example.com/no-coordinates");
  await expect(row.getByTestId("shop-position")).toContainText("No position found");
  await row.getByRole("button", { name: "Save", exact: true }).click();
  await expect(row.getByRole("status")).toHaveText("Saved");

  // Put a valid pin back so later runs/tests start from a clean shop.
  await row.getByLabel("Google Maps URL").fill(urlFor(...OLD_PIN));
  await row.getByRole("button", { name: "Save", exact: true }).click();
  await expect(row.getByRole("status")).toHaveText("Saved");
});

test("renames the shop and the new name shows everywhere", async ({ page }) => {
  const renamed = `${shopName} renamed`;
  const save = (name: string) => shopRow(page, name).getByRole("button", { name: "Save", exact: true });

  await page.goto("/flans/shops");
  await shopRow(page).getByLabel("Name", { exact: true }).fill(renamed);
  await save(shopName).click();
  // The row is found by its heading, so it now answers to the new name.
  await expect(shopRow(page, renamed).getByRole("status")).toHaveText("Saved");

  await page.reload();
  const renamedRow = shopRow(page, renamed);
  await expect(renamedRow).toHaveCount(1);
  await expect(renamedRow.getByLabel("Name", { exact: true })).toHaveValue(renamed);
  // The flans stay attached to the renamed shop.
  await expect(renamedRow.getByText("2 flans · 1 tried")).toBeVisible();

  // An empty name cannot be saved.
  await renamedRow.getByLabel("Name", { exact: true }).fill("   ");
  await save(renamed).click();
  await expect(renamedRow.getByRole("alert")).toBeVisible();

  // Restore the original name.
  await renamedRow.getByLabel("Name", { exact: true }).fill(shopName);
  await save(renamed).click();
  await expect(shopRow(page, shopName).getByRole("status")).toHaveText("Saved");
});
