import { describe, expect, it } from "vitest";

import { joinSteps, pasteIntoSteps, splitSteps } from "@/lib/steps";

describe("splitSteps", () => {
  it("splits on blank lines, trims, drops empties", () => {
    expect(splitSteps("  a  \n\n\n\nb\n\n   \n\nc\n")).toEqual(["a", "b", "c"]);
  });
  it("keeps single newlines inside a step", () => {
    expect(splitSteps("a\nb\n\nc")).toEqual(["a\nb", "c"]);
  });
  it("returns [] for empty input", () => {
    expect(splitSteps("")).toEqual([]);
    expect(splitSteps("  \n\n ")).toEqual([]);
  });
});

describe("joinSteps", () => {
  it("trims, drops empty, joins with blank line", () => {
    expect(joinSteps([" a ", "", "  ", "b"])).toBe("a\n\nb");
  });
  it("round-trips with splitSteps", () => {
    expect(splitSteps(joinSteps(["x", "y"]))).toEqual(["x", "y"]);
  });
});

describe("pasteIntoSteps on blur (own text)", () => {
  it("splits a step that contains a blank line", () => {
    const steps = ["a", "b\n\nc", "d"];
    expect(pasteIntoSteps(steps, 1, steps[1])).toEqual({
      steps: ["a", "b", "c", "d"],
      focusIndex: 2,
    });
  });
  it("leaves a step without blank line alone", () => {
    expect(pasteIntoSteps(["a\nb"], 0, "a\nb")).toBeNull();
  });
});

describe("pasteIntoSteps", () => {
  it("returns null when the paste has no blank line", () => {
    expect(pasteIntoSteps(["a", "b"], 0, "one\ntwo")).toBeNull();
  });
  it("replaces the step with the first chunk and inserts the rest after", () => {
    expect(pasteIntoSteps(["a", "z"], 0, "1\n\n2\n\n3")).toEqual({
      steps: ["1", "2", "3", "z"],
      focusIndex: 2,
    });
  });
});
