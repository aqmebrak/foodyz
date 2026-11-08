import { describe, expect, it } from "vitest";

import {
  legacyKey,
  loadProgress,
  PROGRESS_TTL_MS,
  progressKey,
  serializeProgress,
} from "@/lib/recipe-progress";

const NOW = 1_700_000_000_000;

function store(entries: Record<string, string>) {
  return (key: string) => entries[key] ?? null;
}

describe("recipe-progress", () => {
  it("builds keys", () => {
    expect(progressKey("flan")).toBe("recipe-progress-flan");
    expect(legacyKey("flan")).toBe("recipe-steps-flan");
  });

  it("serializes with updatedAt", () => {
    const raw = serializeProgress({ ingredients: ["a"], steps: [1, 0] }, NOW);
    expect(JSON.parse(raw)).toEqual({ ingredients: ["a"], steps: [0, 1], updatedAt: NOW });
  });

  it("round-trips", () => {
    const raw = serializeProgress({ ingredients: ["a", "b"], steps: [2] }, NOW);
    const p = loadProgress(store({ "recipe-progress-x": raw }), "x", NOW + 1000);
    expect(p).toEqual({ ingredients: ["a", "b"], steps: [2] });
  });

  it("ignores progress older than 12h", () => {
    const raw = serializeProgress({ ingredients: ["a"], steps: [1] }, NOW);
    const p = loadProgress(store({ "recipe-progress-x": raw }), "x", NOW + PROGRESS_TTL_MS + 1);
    expect(p).toEqual({ ingredients: [], steps: [] });
  });

  it("keeps progress just inside 12h", () => {
    const raw = serializeProgress({ ingredients: [], steps: [1] }, NOW);
    const p = loadProgress(store({ "recipe-progress-x": raw }), "x", NOW + PROGRESS_TTL_MS);
    expect(p.steps).toEqual([1]);
  });

  it("returns empty on corrupt json or wrong shape", () => {
    expect(loadProgress(store({ "recipe-progress-x": "{nope" }), "x", NOW)).toEqual({
      ingredients: [],
      steps: [],
    });
    expect(
      loadProgress(store({ "recipe-progress-x": '{"ingredients":"a","steps":[1],"updatedAt":1}' }), "x", 2),
    ).toEqual({ ingredients: [], steps: [] });
  });

  it("migrates the legacy steps key when new key is absent", () => {
    const p = loadProgress(store({ "recipe-steps-x": "[0,2]" }), "x", NOW);
    expect(p).toEqual({ ingredients: [], steps: [0, 2] });
  });

  it("ignores corrupt legacy data", () => {
    expect(loadProgress(store({ "recipe-steps-x": "oops" }), "x", NOW).steps).toEqual([]);
    expect(loadProgress(store({ "recipe-steps-x": '["a"]' }), "x", NOW).steps).toEqual([]);
  });

  it("prefers the new key over legacy", () => {
    const raw = serializeProgress({ ingredients: [], steps: [5] }, NOW);
    const p = loadProgress(store({ "recipe-progress-x": raw, "recipe-steps-x": "[1]" }), "x", NOW);
    expect(p.steps).toEqual([5]);
  });

  it("survives a throwing reader", () => {
    const p = loadProgress(() => {
      throw new Error("denied");
    }, "x", NOW);
    expect(p).toEqual({ ingredients: [], steps: [] });
  });
});
