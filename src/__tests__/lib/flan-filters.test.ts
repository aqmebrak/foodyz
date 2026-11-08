import { describe, expect, it } from "vitest";

import { countTried, filterFlans, type FlanItem } from "@/lib/flan-filters";

function flan(over: Partial<FlanItem> & { id: string }): FlanItem {
  return {
    name: "Flan",
    location: { name: "Boulangerie", mapsUrl: "" },
    photoUrl: null,
    rating: 0,
    tried: false,
    triedAt: null,
    comment: null,
    ...over,
  };
}

const flans = [
  flan({ id: "a", name: "Flan nature", tried: true, rating: 5 }),
  flan({ id: "b", name: "Flan pistache", tried: true, rating: 3, location: { name: "Pâtisserie Éclair", mapsUrl: "" } }),
  flan({ id: "c", name: "Flan coco", tried: false }),
];
const base = { query: "", minRating: 0, status: "all" as const };

describe("filterFlans", () => {
  it("returns everything by default", () => {
    expect(filterFlans(flans, base)).toHaveLength(3);
  });
  it("filters by status", () => {
    expect(filterFlans(flans, { ...base, status: "tried" }).map((f) => f.id)).toEqual(["a", "b"]);
    expect(filterFlans(flans, { ...base, status: "to-try" }).map((f) => f.id)).toEqual(["c"]);
  });
  it("min rating excludes untried flans", () => {
    expect(filterFlans(flans, { ...base, minRating: 4 }).map((f) => f.id)).toEqual(["a"]);
  });
  it("searches name and location, accent-insensitive", () => {
    expect(filterFlans(flans, { ...base, query: "eclair" }).map((f) => f.id)).toEqual(["b"]);
    expect(filterFlans(flans, { ...base, query: "COCO" }).map((f) => f.id)).toEqual(["c"]);
  });
});

describe("countTried", () => {
  it("counts tried and to-try", () => {
    expect(countTried(flans)).toEqual({ tried: 2, toTry: 1 });
  });
});
