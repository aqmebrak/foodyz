import fs from "fs";
import path from "path";
import { expect,test as setup } from "@playwright/test";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate as admin", async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/admin/);
  await page.context().storageState({ path: authFile });
});
