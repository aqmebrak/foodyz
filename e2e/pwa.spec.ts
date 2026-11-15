import { expect, test } from "@playwright/test";

// PWA assets must load without a session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("PWA assets", () => {
  test("sw.js is public javascript", async ({ request }) => {
    const res = await request.get("/sw.js", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/javascript/);
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("offline.html is public", async ({ request }) => {
    const res = await request.get("/offline.html", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect((await res.text()).toLowerCase()).toContain("offline");
  });

  test("manifest is public and valid", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.shortcuts).toHaveLength(2);
  });

  test("lookalikes stay gated", async ({ page }) => {
    for (const path of ["/sw.js.map", "/offline.html.bak"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
