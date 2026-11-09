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
 * Resolves a Google Maps short link to its full URL (which carries the coordinates).
 *
 * Only the short-link hops are fetched: the first redirect already points at the full
 * `google.com/maps/place/...!3d..!4d..` URL, and fetching that one would only bounce through
 * `consent.google.com`. Only https Google Maps hosts are ever fetched or followed. On any
 * failure the best URL reached so far is returned (the original one if nothing resolved).
 */
export async function expandMapsShortUrl(url: string): Promise<string> {
  let current = url;
  try {
    for (let hop = 0; hop < 3 && isShortMapsUrl(current); hop++) {
      const res = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      const location = res.headers.get("location");
      if (res.status < 300 || res.status >= 400 || !location) break;
      const next = new URL(location, current);
      if (next.protocol !== "https:" || !MAPS_HOSTS.has(next.hostname)) break;
      current = next.toString();
    }
  } catch {
    // keep `current`
  }
  return current;
}
