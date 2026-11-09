import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("checkRateLimit", () => {
  it("allows 10 attempts then blocks the 11th with a retry delay", () => {
    for (let i = 0; i < 10; i++) expect(checkRateLimit("k-block").allowed).toBe(true);
    const blocked = checkRateLimit("k-block");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 11; i++) checkRateLimit("k-a");
    expect(checkRateLimit("k-b").allowed).toBe(true);
  });

  it("resets after the 15-minute window", () => {
    for (let i = 0; i < 11; i++) checkRateLimit("k-reset");
    expect(checkRateLimit("k-reset").allowed).toBe(false);
    vi.advanceTimersByTime(15 * 60 * 1000);
    expect(checkRateLimit("k-reset").allowed).toBe(true);
  });
});
