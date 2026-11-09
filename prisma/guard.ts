/**
 * Refuses to run destructive/seeding code against a non-local database.
 * Used by prisma/seed.ts and playwright.config.ts. CI's postgres service is on localhost, so it passes.
 * Escape hatch (deliberate remote seeding only): ALLOW_NON_LOCAL_DB=1.
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "db-dev", "db-test"]);

export function assertLocalDatabase(url = process.env.DATABASE_URL): void {
  if (process.env.ALLOW_NON_LOCAL_DB === "1") return;
  if (!url) throw new Error("DATABASE_URL is not set.");
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error("DATABASE_URL is not a valid URL.");
  }
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run against non-local database host "${host}". ` +
        `Point DATABASE_URL/DIRECT_URL at the local Docker DB (pnpm db:up) or set ALLOW_NON_LOCAL_DB=1 if you really mean it.`
    );
  }
}
