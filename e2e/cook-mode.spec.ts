import { expect, test } from "@playwright/test";

// Seeded recipe: 8 servings, chocolat noir 200 g, oeuf 3, 6 steps.
const SLUG = "gateau-au-chocolat";

test.describe("Recipe detail: servings and progress", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/recipes/${SLUG}`);
    await expect(page.getByRole("checkbox", { name: /chocolat noir/i })).toBeVisible();
  });

  test("servings stepper scales quantities, fractions included", async ({ page }) => {
    const chocolate = page.getByRole("checkbox", { name: /chocolat noir/i });
    const eggs = page.getByRole("checkbox", { name: /oeuf/i });
    await expect(chocolate).toContainText("200 g");
    await expect(eggs).toContainText("3");

    for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Decrease servings" }).click();
    await expect(chocolate).toContainText("100 g");
    await expect(eggs).toContainText("1.5");

    await page.getByRole("button", { name: "Increase servings" }).click();
    await expect(chocolate).toContainText("125 g");
  });

  test("ingredient and step ticks survive a reload, reset clears them", async ({ page }) => {
    const chocolate = page.getByRole("checkbox", { name: /chocolat noir/i });
    const firstStep = page.getByRole("button", { name: /Préchauffer le four/ });

    await chocolate.click();
    await firstStep.click();
    await expect(chocolate).toBeChecked();
    await expect(firstStep).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("1/6 done")).toBeVisible();

    // The localStorage write is synchronous with the click; reload must restore it.
    await page.reload();
    await expect(chocolate).toBeChecked();
    await expect(firstStep).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate((s) => localStorage.getItem(`recipe-progress-${s}`), SLUG)).not.toBeNull();

    // Untick a single item
    await chocolate.click();
    await expect(chocolate).not.toBeChecked();

    await page.getByRole("button", { name: "Reset progress" }).first().click();
    await expect(firstStep).toHaveAttribute("aria-pressed", "false");
    await page.reload();
    await expect(firstStep).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: "Reset progress" })).toHaveCount(0);
  });

  test("cooking mode opens and closes", async ({ page }) => {
    await page.getByRole("button", { name: "Start cooking" }).click();
    const cook = page.getByRole("dialog", { name: "Cooking mode" });
    await expect(cook).toBeVisible();
    await cook.getByRole("button", { name: "Close cooking mode" }).click();
    await expect(cook).toBeHidden();
  });
});
