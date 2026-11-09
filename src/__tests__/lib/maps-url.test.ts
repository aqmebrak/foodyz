import { afterEach, describe, expect, it, vi } from "vitest";

import { expandMapsShortUrl, isShortMapsUrl } from "@/lib/maps-url";
import { parseGoogleMapsUrl } from "@/lib/utils";

const short = "https://maps.app.goo.gl/abc";
const full = "https://www.google.com/maps/place/X/@1,2,17z/data=!3d1.5!4d2.5";
const redirect = (location: string) => new Response(null, { status: 302, headers: { location } });
const stubFetch = (f: ReturnType<typeof vi.fn>) => vi.stubGlobal("fetch", f);

afterEach(() => vi.unstubAllGlobals());

describe("isShortMapsUrl", () => {
  it("matches maps.app.goo.gl and goo.gl/maps over https only", () => {
    expect(isShortMapsUrl("https://maps.app.goo.gl/abc")).toBe(true);
    expect(isShortMapsUrl("https://goo.gl/maps/abc")).toBe(true);
    expect(isShortMapsUrl("https://goo.gl/other")).toBe(false);
    expect(isShortMapsUrl("http://maps.app.goo.gl/abc")).toBe(false);
    expect(isShortMapsUrl("https://www.google.com/maps/place/X")).toBe(false);
    expect(isShortMapsUrl("nonsense")).toBe(false);
  });
});

describe("expandMapsShortUrl", () => {
  it("returns the full URL after the first redirect without fetching it (consent bounce)", async () => {
    // Real behaviour: maps.app.goo.gl -> 302 -> google.com/maps/place/...!3d!4d (full URL).
    // Fetching that one redirects to consent.google.com, so we must stop at the first hop.
    const f = vi.fn().mockResolvedValueOnce(redirect(full));
    stubFetch(f);
    const result = await expandMapsShortUrl(short);
    expect(result).toBe(full);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
    expect(parseGoogleMapsUrl(result)).toEqual([1.5, 2.5]);
  });

  it("follows chained short links", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(redirect("https://goo.gl/maps/zzz"))
      .mockResolvedValueOnce(redirect(full));
    stubFetch(f);
    expect(await expandMapsShortUrl(short)).toBe(full);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("stops after 3 hops", async () => {
    const f = vi.fn().mockImplementation(async () => redirect("https://goo.gl/maps/loop"));
    stubFetch(f);
    await expandMapsShortUrl(short);
    expect(f).toHaveBeenCalledTimes(3);
  });

  it("does not follow a non-Google redirect target", async () => {
    const f = vi.fn().mockResolvedValue(redirect("https://evil.example.com/x"));
    stubFetch(f);
    expect(await expandMapsShortUrl(short)).toBe(short);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("does not follow a non-https redirect target", async () => {
    const f = vi.fn().mockResolvedValue(redirect("http://www.google.com/maps"));
    stubFetch(f);
    expect(await expandMapsShortUrl(short)).toBe(short);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("keeps the last good URL when a later redirect leaves the allowlist", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(redirect("https://goo.gl/maps/mid"))
      .mockResolvedValueOnce(redirect("https://consent.example.com/x"));
    stubFetch(f);
    expect(await expandMapsShortUrl(short)).toBe("https://goo.gl/maps/mid");
  });

  it("never fetches a host outside the allowlist or an already-full URL", async () => {
    const f = vi.fn();
    stubFetch(f);
    expect(await expandMapsShortUrl("https://evil.example.com/x")).toBe("https://evil.example.com/x");
    expect(await expandMapsShortUrl(full)).toBe(full);
    expect(f).not.toHaveBeenCalled();
  });

  it("returns the original URL on fetch error or timeout", async () => {
    stubFetch(vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")));
    expect(await expandMapsShortUrl(short)).toBe(short);
  });
});
