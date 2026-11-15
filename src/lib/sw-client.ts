const CACHE_PREFIX = "foodyz-";

/** Registers the service worker. Production only: dev would cache stale HMR assets. */
export async function registerServiceWorker(): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    // Offline support is an enhancement; never break the app over it.
  }
}

/** Wipes offline copies of private pages (call on sign-out). Swallows every error. */
export async function clearOfflineCaches(): Promise<void> {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_CACHES" });
  } catch {
    // ignore
  }
  try {
    if (typeof caches === "undefined") return;
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)));
  } catch {
    // ignore
  }
}
