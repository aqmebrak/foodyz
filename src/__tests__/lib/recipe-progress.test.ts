import { describe, expect, it } from "vitest";

import {
  filterProgress,
  FUTURE_SKEW_MS,
  legacyKey,
  loadProgress,
  migrateLegacy,
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

describe("recipe-progress hardening", () => {
  it("treats future-dated updatedAt (> 5min skew) as expired", () => {
    const raw = serializeProgress({ ingredients: ["a"], steps: [1] }, NOW + FUTURE_SKEW_MS + 1);
    expect(loadProgress(store({ "recipe-progress-x": raw }), "x", NOW)).toEqual({
      ingredients: [],
      steps: [],
    });
  });

  it("tolerates small clock skew (<= 5min)", () => {
    const raw = serializeProgress({ ingredients: [], steps: [1] }, NOW + FUTURE_SKEW_MS);
    expect(loadProgress(store({ "recipe-progress-x": raw }), "x", NOW).steps).toEqual([1]);
  });

  it("filterProgress drops out-of-range steps and unknown ingredient ids", () => {
    const p = filterProgress(
      { ingredients: ["a", "gone"], steps: [0, 2, 3, 9] },
      { stepCount: 3, ingredientIds: new Set(["a", "b"]) },
    );
    expect(p).toEqual({ ingredients: ["a"], steps: [0, 2] });
  });

  it("filterProgress leaves ingredients alone when ids are not provided", () => {
    const p = filterProgress({ ingredients: ["a"], steps: [5] }, { stepCount: 2 });
    expect(p).toEqual({ ingredients: ["a"], steps: [] });
  });

  it("migrateLegacy stamps legacy steps into the new key with the current time and removes legacy", () => {
    const data: Record<string, string> = { "recipe-steps-x": "[0,2]" };
    const migrated = migrateLegacy(
      (k) => data[k] ?? null,
      (k, v) => void (data[k] = v),
      (k) => void delete data[k],
      "x",
      NOW,
    );
    expect(migrated).toBe(true);
    expect(data["recipe-steps-x"]).toBeUndefined();
    expect(JSON.parse(data["recipe-progress-x"])).toEqual({ ingredients: [], steps: [0, 2], updatedAt: NOW });
    // now it expires like any other progress
    expect(loadProgress((k) => data[k] ?? null, "x", NOW + PROGRESS_TTL_MS + 1).steps).toEqual([]);
  });

  it("migrateLegacy does nothing when new key exists or legacy is invalid", () => {
    const data: Record<string, string> = {
      "recipe-progress-x": serializeProgress({ ingredients: [], steps: [1] }, NOW),
      "recipe-steps-x": "[0]",
    };
    const w = () => {
      throw new Error("should not write");
    };
    expect(migrateLegacy((k) => data[k] ?? null, w, w, "x", NOW)).toBe(false);
    expect(migrateLegacy((k) => ({ "recipe-steps-y": "oops" })[k] ?? null, w, w, "y", NOW)).toBe(false);
  });
});
