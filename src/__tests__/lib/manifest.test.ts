import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("web app manifest", () => {
  const m = manifest();

  it("has id, scope, lang, orientation", () => {
    expect(m.id).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.lang).toBe("en");
    expect(m.orientation).toBe("portrait");
  });

  it("has categories", () => {
    expect(m.categories).toContain("food");
  });

  it("has shortcuts to new recipe and flans", () => {
    expect(m.shortcuts?.map((s) => s.url)).toEqual(["/recipes/new", "/flan"]);
  });

  it("theme_color matches viewport theme color", () => {
    expect(m.theme_color).toBe("#EDF1E8");
  });

  it("still has 192, 512 and maskable icons", () => {
    const icons = m.icons ?? [];
    expect(icons.some((i) => i.sizes === "192x192")).toBe(true);
    expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "any")).toBe(true);
    expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
  });
});
