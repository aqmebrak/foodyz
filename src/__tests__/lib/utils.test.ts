import { describe, expect, it } from "vitest";

import {
  cn,
  formatDistance,
  formatDuration,
  haversineMeters,
  normalizeStr,
  parseGoogleMapsUrl,
  rankLocationsByDistance,
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

  it("transliterates accented characters", () => {
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
  });

  it("handles ç, ñ and œ-free mixed input", () => {
    expect(slugify("Garçon à l'été")).toBe("garcon-a-lete");
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

  it("prefers !3d!4d over the @ camera centre", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/place/Boulangerie+X/@45.7612,4.8412,17z/data=!3m1!4b1!4m6!3m5!1s0x47f4ea5a:0x1!8m2!3d45.7578!4d4.832!16s%2Fg%2F1"
      )
    ).toEqual([45.7578, 4.832]);
  });

  it("uses the last !3d!4d pair when several appear", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/dir/A/B/@45.7,4.8,15z/data=!3d45.1!4d4.1!3d45.7578!4d4.832"
      )
    ).toEqual([45.7578, 4.832]);
  });

  it("prefers !3d!4d over ?q=", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps?q=45.1,4.1&data=!3d45.2!4d4.2")
    ).toEqual([45.2, 4.2]);
  });

  it("reads query= and ll= forms", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/search/?api=1&query=45.75,4.85")
    ).toEqual([45.75, 4.85]);
    expect(parseGoogleMapsUrl("https://maps.google.com/?ll=45.75,4.85&z=15")).toEqual([
      45.75, 4.85,
    ]);
  });

  it("prefers ?q= over @", () => {
    expect(parseGoogleMapsUrl("https://www.google.com/maps/@45.1,4.1,15z?q=45.75,4.85")).toEqual(
      [45.75, 4.85]
    );
  });

  it("prefers /place/name/lat,lng over @", () => {
    expect(
      parseGoogleMapsUrl("https://www.google.com/maps/place/Pat/45.75,4.85/@45.1,4.1,17z")
    ).toEqual([45.75, 4.85]);
  });

  it("rejects out-of-range coordinates", () => {
    expect(parseGoogleMapsUrl("https://maps.google.com/?q=95.5,4.85")).toBeNull();
    expect(parseGoogleMapsUrl("https://www.google.com/maps/@45.7,190.5,17z")).toBeNull();
    expect(parseGoogleMapsUrl("https://x/data=!3d91!4d4")).toBeNull();
  });

  it("returns null for garbage and short links", () => {
    expect(parseGoogleMapsUrl("garbage")).toBeNull();
    expect(parseGoogleMapsUrl("https://maps.app.goo.gl/abc123")).toBeNull();
  });

  it("returns null when no coordinates can be found", () => {
    expect(parseGoogleMapsUrl("https://maps.google.com/?q=some+place")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseGoogleMapsUrl("")).toBeNull();
  });
});

describe("haversineMeters", () => {
  it("is zero for identical points", () => {
    expect(haversineMeters([45.764, 4.8357], [45.764, 4.8357])).toBe(0);
  });

  it("computes ~111 km per degree of latitude", () => {
    const d = haversineMeters([45, 4.8], [46, 4.8]);
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(111_400);
  });

  it("computes a short Lyon distance (~120 m)", () => {
    const d = haversineMeters([45.764, 4.8357], [45.76508, 4.8357]);
    expect(d).toBeGreaterThan(115);
    expect(d).toBeLessThan(125);
  });

  it("is symmetric", () => {
    const a: [number, number] = [45.75, 4.85];
    const b: [number, number] = [45.77, 4.82];
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});

describe("rankLocationsByDistance", () => {
  const here: [number, number] = [45.764, 4.8357];
  const locs = [
    { id: "far", name: "Far", mapsUrl: "https://www.google.com/maps/@45.80,4.90,17z" },
    { id: "short", name: "Short link", mapsUrl: "https://maps.app.goo.gl/abc" },
    { id: "near", name: "Near", mapsUrl: "https://www.google.com/maps/@45.7651,4.8357,17z" },
    { id: "short2", name: "Another short", mapsUrl: "https://maps.app.goo.gl/def" },
  ];

  it("sorts by distance, with distances attached", () => {
    const ranked = rankLocationsByDistance(locs, here);
    expect(ranked.map((r) => r.location.id)).toEqual(["near", "far", "short", "short2"]);
    expect(ranked[0].distance).toBeGreaterThan(100);
    expect(ranked[0].distance).toBeLessThan(130);
  });

  it("puts locations without coords last, keeping input order", () => {
    const ranked = rankLocationsByDistance(locs, here);
    expect(ranked[2].distance).toBeNull();
    expect(ranked[3].distance).toBeNull();
  });

  it("does not mutate the input", () => {
    const copy = [...locs];
    rankLocationsByDistance(locs, here);
    expect(locs).toEqual(copy);
  });
});

describe("formatDistance", () => {
  it("formats meters and kilometers", () => {
    expect(formatDistance(120.4)).toBe("120 m");
    expect(formatDistance(1500)).toBe("1.5 km");
  });
});
