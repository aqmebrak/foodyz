import { describe, expect, it } from "vitest";

import { timerView } from "@/hooks/use-cook-timers";

const t = { id: "a", label: "5 min", endsAt: 10_000 + 300_000, durationMs: 300_000 };

describe("timerView", () => {
  it("counts down", () => {
    expect(timerView(t, 10_000 + 1_000)).toMatchObject({ remainingSeconds: 299, done: false });
  });
  it("is done at/after endsAt", () => {
    expect(timerView(t, t.endsAt)).toMatchObject({ remainingSeconds: 0, done: true });
  });
  it("a stale now before the start is not done and shows full duration", () => {
    expect(timerView(t, 0)).toMatchObject({ remainingSeconds: 300, done: false });
  });
});
