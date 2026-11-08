import { describe, expect, it } from "vitest";

import {
  cn,
  formatDuration,
  normalizeStr,
  parseGoogleMapsUrl,
  slugify,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind classes to the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Pasta Carbonara!")).toBe("pasta-carbonara");
  });

  it("collapses whitespace and underscores into single hyphens", () => {
    expect(slugify("foo   bar_baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  -Hello World-  ")).toBe("hello-world");
  });

  it("strips punctuation", () => {
    expect(slugify("Pasta (homemade)!!")).toBe("pasta-homemade");
  });

  it("strips accented characters rather than transliterating them", () => {
    // \w in the slugify regex is ASCII-only, so accents are dropped, not
    // normalized — "Crème brûlée" becomes "crme-brle", not "creme-brulee".
    expect(slugify("Crème brûlée")).toBe("crme-brle");
  });

  it("returns an empty string for only-punctuation input", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("normalizeStr", () => {
  it("strips diacritics and lowercases", () => {
    expect(normalizeStr("Café")).toBe("cafe");
  });

  it("matches accented and unaccented variants", () => {
    expect(normalizeStr("café")).toBe(normalizeStr("CAFE"));
  });

  it("leaves plain ASCII lowercase text untouched", () => {
    expect(normalizeStr("recipe")).toBe("recipe");
  });
});

describe("formatDuration", () => {
  it("formats minutes under an hour as 'Xmin'", () => {
    expect(formatDuration(45)).toBe("45min");
  });

  it("formats exact hours without a minutes suffix", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours plus remaining minutes", () => {
    expect(formatDuration(90)).toBe("1h 30min");
  });

  it("formats zero minutes", () => {
    expect(formatDuration(0)).toBe("0min");
  });
});

describe("parseGoogleMapsUrl", () => {
  it("extracts coordinates from an @lat,lng,zoom URL", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/place/Foo/@45.764,4.8357,17z")
    ).toEqual([45.764, 4.8357]);
  });

  it("extracts coordinates from a ?q=lat,lng URL", () => {
    expect(parseGoogleMapsUrl("https://maps.google.com/?q=45.75,4.85")).toEqual([
      45.75, 4.85,
    ]);
  });

  it("extracts coordinates from a /place/name/lat,lng URL", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/place/Patisserie/45.75,4.85")
    ).toEqual([45.75, 4.85]);
  });

  it("supports negative coordinates", () => {
    expect(parseGoogleMapsUrl("https://maps.google.com/?q=-33.87,151.21")).toEqual([
      -33.87, 151.21,
    ]);
  });

  it("returns null when no coordinates can be found", () => {
    expect(parseGoogleMapsUrl("https://maps.google.com/?q=some+place")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseGoogleMapsUrl("")).toBeNull();
  });
});
