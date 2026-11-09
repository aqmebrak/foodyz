import { describe, expect, it } from "vitest";

import {
  clearSheetFilters,
  countActiveFilters,
  countVisible,
  type FilterableRecipe,
  filterRecipes,
  parseFilters,
  pushRecent,
  serializeFilters,
} from "@/lib/recipe-filters";

function r(over: Partial<FilterableRecipe> & { title: string }): FilterableRecipe {
  return {
    slug: over.title.toLowerCase(),
    published: true,
    difficulty: "EASY",
    prepTime: 10,
    cookTime: 10,
    servings: 4,
    tags: [],
    ingredients: [],
    ...over,
  };
}

const none = parseFilters(new URLSearchParams());

describe("filterRecipes", () => {
  const recipes = [
    r({ title: "Pâtes cacio e pepe", ingredients: [{ ingredient: { name: "Pecorino romano" } }] }),
    r({ title: "Gâteau", tags: [{ tag: { name: "Dessert" } }], difficulty: "HARD", prepTime: 30, cookTime: 40, servings: 8 }),
    r({ title: "Brouillon", published: false }),
  ];

  it("hides drafts by default and shows them with drafts=true", () => {
    expect(filterRecipes(recipes, none).map((x) => x.title)).not.toContain("Brouillon");
    expect(filterRecipes(recipes, { ...none, drafts: true }).map((x) => x.title)).toContain("Brouillon");
  });

  it("matches title accent-insensitively", () => {
    expect(filterRecipes(recipes, { ...none, q: "gateau" })).toHaveLength(1);
    expect(filterRecipes(recipes, { ...none, q: "PATES" })).toHaveLength(1);
  });

  it("matches ingredient names", () => {
    expect(filterRecipes(recipes, { ...none, q: "pecorino" }).map((x) => x.title)).toEqual(["Pâtes cacio e pepe"]);
  });

  it("filters by tag, difficulty, total time, servings", () => {
    expect(filterRecipes(recipes, { ...none, tag: "Dessert" })).toHaveLength(1);
    expect(filterRecipes(recipes, { ...none, diff: "HARD" })).toHaveLength(1);
    expect(filterRecipes(recipes, { ...none, time: 30 })).toHaveLength(1);
    expect(filterRecipes(recipes, { ...none, serv: "5+" }).map((x) => x.title)).toEqual(["Gâteau"]);
    expect(filterRecipes(recipes, { ...none, serv: "3-4" })).toHaveLength(1);
  });
});

describe("url state", () => {
  it("round-trips", () => {
    const f = { q: "tarte", tag: "Dessert", diff: "EASY", time: 45, serv: "3-4", drafts: true };
    expect(parseFilters(new URLSearchParams(serializeFilters(f)))).toEqual(f);
  });
  it("omits defaults and ignores junk", () => {
    expect(serializeFilters(none)).toBe("");
    expect(parseFilters(new URLSearchParams("time=abc&diff=NOPE&serv=9")).time).toBe(0);
    expect(parseFilters(new URLSearchParams("diff=NOPE")).diff).toBe("");
  });
  it("keeps unrelated params out", () => {
    expect(serializeFilters({ ...none, q: "a b" })).toBe("q=a+b");
  });
});

describe("countActiveFilters", () => {
  it("counts sheet filters only", () => {
    expect(countActiveFilters(none)).toBe(0);
    expect(countActiveFilters({ ...none, q: "x", tag: "y" })).toBe(0);
    expect(countActiveFilters({ ...none, diff: "EASY", time: 20, serv: "5+", drafts: true })).toBe(4);
  });
});

describe("pushRecent", () => {
  it("puts newest first, dedupes, caps at 5", () => {
    expect(pushRecent(["a", "b"], "b")).toEqual(["b", "a"]);
    expect(pushRecent(["a", "b", "c", "d", "e"], "f")).toEqual(["f", "a", "b", "c", "d"]);
  });
});

describe("clearSheetFilters", () => {
  it("clears sheet filters but keeps search text and tag", () => {
    const f = { q: "pâtes", tag: "Dessert", diff: "HARD", time: 30, serv: "5+", drafts: true };
    expect(clearSheetFilters(f)).toEqual({ q: "pâtes", tag: "Dessert", diff: "", time: 0, serv: "", drafts: false });
  });
});

describe("countVisible", () => {
  const rs = [r({ title: "A" }), r({ title: "B", published: false })];
  it("excludes drafts unless shown", () => {
    expect(countVisible(rs, false)).toBe(1);
    expect(countVisible(rs, true)).toBe(2);
  });
});
