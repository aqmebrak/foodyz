import { expect, test } from "@playwright/test";

// Desktop sidebar: everyday screens up top, data management in a collapsible "Admin" submenu at the bottom.

test.describe("Desktop sidebar", () => {
  test.beforeEach(({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1280) < 768, "sidebar is desktop-only (md+)");
  });

  test("shows everyday items directly and keeps admin items in a collapsed submenu", async ({ page }) => {
    await page.goto("/recipes");
    const main = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Recipes", "New recipe", "Flan map"]) {
      await expect(main.getByRole("link", { name })).toBeVisible();
    }
    for (const name of ["Categories", "Ingredients", "Units", "Manage flans", "Flan shops"]) {
      await expect(main.getByRole("link", { name })).toHaveCount(0);
    }

    const admin = page.getByRole("button", { name: "Admin" });
    await expect(admin).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("navigation", { name: "Admin" })).toHaveCount(0);

    await admin.click();
    await expect(admin).toHaveAttribute("aria-expanded", "true");
    const adminNav = page.getByRole("navigation", { name: "Admin" });
    for (const name of ["Categories", "Ingredients", "Units", "Manage flans", "Flan shops"]) {
      await expect(adminNav.getByRole("link", { name })).toBeVisible();
    }
  });

  test("opens the Admin submenu on an admin route and marks the page as current", async ({ page }) => {
    await page.goto("/flans/shops");
    await expect(page.getByRole("button", { name: "Admin" })).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Flan shops" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Flan shops" })).toBeVisible();
    // "Manage flans" (/flans) is a sibling, not the parent: it must not light up too.
    await expect(
      page.getByRole("navigation", { name: "Admin" }).getByRole("link", { name: "Manage flans" }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("Recipes is not highlighted on the new-recipe page", async ({ page }) => {
    await page.goto("/recipes/new");
    const main = page.getByRole("navigation", { name: "Main" });
    await expect(main.getByRole("link", { name: "New recipe" })).toHaveAttribute("aria-current", "page");
    await expect(main.getByRole("link", { name: "Recipes", exact: true })).not.toHaveAttribute("aria-current", "page");
  });
});

test("mobile More sheet links to the shop editing view", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 768, "mobile-only");
  await page.goto("/recipes");
  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("link", { name: "Flan shops" }).click();
  await expect(page).toHaveURL(/\/flans\/shops$/);
});
