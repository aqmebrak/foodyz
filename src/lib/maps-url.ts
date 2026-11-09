// Google Maps short-link expansion. Kept out of `src/actions` so it is not exposed as a Server Action.

const MAPS_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
  "www.google.fr",
  "google.fr",
]);

export function isShortMapsUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    if (u.hostname === "maps.app.goo.gl") return true;
    return u.hostname === "goo.gl" && u.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}

/**
 * Resolves a Google Maps short link to its full URL (which carries coordinates).
 * Only https Google Maps hosts are ever fetched/followed; any failure returns the original URL.
 */
export async function expandMapsShortUrl(url: string): Promise<string> {
  try {
    let current = url;
    for (let hop = 0; hop < 3; hop++) {
      const u = new URL(current);
      if (u.protocol !== "https:" || !MAPS_HOSTS.has(u.hostname)) return url;
      const res = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      const location = res.headers.get("location");
      if (res.status < 300 || res.status >= 400 || !location) return current === url ? url : current;
      const next = new URL(location, current);
      if (next.protocol !== "https:" || !MAPS_HOSTS.has(next.hostname)) return url;
      current = next.toString();
    }
    return current;
  } catch {
    return url;
  }
}
