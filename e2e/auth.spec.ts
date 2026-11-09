import { expect, test } from "@playwright/test";

// NOTE: loginAction's in-memory rate limit counts EVERY attempt (success or failure)
// at 10 / 15 min / IP, per dev-server process. A full run uses 1 (auth.setup) + 1 here.
// Keep failing attempts to a minimum.

test.describe("Unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("visiting /recipes redirects to /login", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("private recipe detail redirects to /login", async ({ page }) => {
    await page.goto("/recipes/gateau-au-chocolat");
    await expect(page).toHaveURL(/\/login/);
  });

  test("wrong password shows an error and stays on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Authenticated", () => {
  test("Sign out returns to /login and re-locks the app", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/login/);
  });
});
