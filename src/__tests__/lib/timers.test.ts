import { describe, expect, it } from "vitest";

import { formatCountdown, parseTimers } from "@/lib/timers";

const secs = (s: string) => parseTimers(s).map((t) => t.seconds);

describe("parseTimers", () => {
  it("parses minutes in several spellings", () => {
    expect(secs("Cuire 12 minutes.")).toEqual([720]);
    expect(secs("Cuire 12 min.")).toEqual([720]);
    expect(secs("Cuire 12mn.")).toEqual([720]);
    expect(secs("Bake 12 minutes")).toEqual([720]);
    expect(secs("1 minute")).toEqual([60]);
  });

  it("parses hours, with and without minutes", () => {
    expect(secs("Laisser 1 h 30 au four")).toEqual([5400]);
    expect(secs("Laisser 1h30")).toEqual([5400]);
    expect(secs("1 heure")).toEqual([3600]);
    expect(secs("2 heures")).toEqual([7200]);
    expect(secs("1 hour")).toEqual([3600]);
    expect(secs("1 h 30 min")).toEqual([5400]);
    expect(secs("1,5 heure")).toEqual([5400]);
  });

  it("parses simple fractions and half-hours", () => {
    expect(secs("Laisser 1/2 heure")).toEqual([1800]);
    expect(secs("½ h")).toEqual([1800]);
    expect(secs("Cuire 1/2 h")).toEqual([1800]);
    expect(secs("1/4 d'heure")).toEqual([900]);
    expect(secs("1/2 minute")).toEqual([30]);
    expect(secs("1 heure et demie")).toEqual([5400]);
    expect(secs("2 heures et demi")).toEqual([9000]);
  });

  it("does not misread fractions of quantities as timers", () => {
    expect(secs("Ajouter 1/2 cuillère")).toEqual([]);
    expect(secs("Verser 1/2 l de lait")).toEqual([]);
  });

  it("parses seconds", () => {
    expect(secs("30 secondes")).toEqual([30]);
    expect(secs("Saisir 45 s")).toEqual([45]);
    expect(secs("90 seconds")).toEqual([90]);
  });

  it("uses the upper bound of a range", () => {
    expect(secs("10-12 minutes")).toEqual([720]);
    expect(secs("10 à 12 min")).toEqual([720]);
    expect(secs("1-2 heures")).toEqual([7200]);
  });

  it("returns several timers with their index, in order", () => {
    const step = "Cuire 5 min, puis reposer 10 minutes.";
    const t = parseTimers(step);
    expect(t.map((x) => x.seconds)).toEqual([300, 600]);
    expect(t[0].index).toBe(step.indexOf("5 min"));
    expect(t[1].index).toBe(step.indexOf("10 minutes"));
  });

  it("labels compactly", () => {
    expect(parseTimers("12 minutes")[0].label).toBe("12 min");
    expect(parseTimers("1h30")[0].label).toBe("1 h 30");
    expect(parseTimers("45 s")[0].label).toBe("45 s");
    expect(parseTimers("2 heures")[0].label).toBe("2 h");
  });

  it("ignores temperatures, quantities and other numbers", () => {
    expect(parseTimers("Préchauffer le four à 180°C")).toEqual([]);
    expect(parseTimers("Ajouter 2 œufs et 200 g de sucre")).toEqual([]);
    expect(parseTimers("Ajouter 3 saucisses")).toEqual([]);
    expect(parseTimers("Add 2 steaks and 1 sheet")).toEqual([]);
    expect(parseTimers("Étape 5. Mélanger")).toEqual([]);
    expect(parseTimers("Préchauffer à 180 °C (th. 6)")).toEqual([]);
    expect(parseTimers("")).toEqual([]);
  });

  it("does not swallow a following quantity after hours", () => {
    expect(secs("Attendre 2 heures 3 œufs")).toEqual([7200]);
    expect(secs("1 h 30 de cuisson")).toEqual([5400]);
    expect(secs("1 h 200 g de farine")).toEqual([3600]);
  });
});

describe("formatCountdown", () => {
  it("formats countdown values", () => {
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(5)).toBe("0:05");
    expect(formatCountdown(3725)).toBe("1:02:05");
    expect(formatCountdown(0)).toBe("0:00");
  });
});
