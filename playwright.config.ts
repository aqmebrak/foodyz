import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

import { assertLocalDatabase } from "./prisma/guard";

config({ path: ".env" });
// Locally, e2e always runs against the disposable test DB (.env.test, override wins over .env).
// In CI the workflow's own env vars (postgres service + secrets) are used instead.
if (!process.env.CI) config({ path: ".env.test", override: true });
// Never let a write-heavy e2e run touch a non-local database.
assertLocalDatabase();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      // Read-only spec only: mobile viewport checks must never run the data-writing specs.
      name: "mobile-safari",
      testMatch: /public\.spec\.ts/,
      use: {
        ...devices["iPhone 13 Pro"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    // Never reuse a dev server: it may be connected to the dev DB rather than the test DB.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
