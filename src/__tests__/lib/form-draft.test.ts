import { describe, expect, it } from "vitest";

import { formatRelativeTime, parseDraft, serializeDraft } from "@/lib/form-draft";

describe("draft serialization", () => {
  it("round-trips values and savedAt", () => {
    const raw = serializeDraft({ title: "x" }, 1000);
    expect(parseDraft<{ title: string }>(raw)).toEqual({
      values: { title: "x" },
      savedAt: 1000,
    });
  });
  it("returns null for null, junk, or wrong shape", () => {
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft("{nope")).toBeNull();
    expect(parseDraft('{"values":1}')).toBeNull();
    expect(parseDraft('{"savedAt":1}')).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  const now = 10_000_000_000;
  it("formats ranges", () => {
    expect(formatRelativeTime(now - 5_000, now)).toBe("just now");
    expect(formatRelativeTime(now - 60_000, now)).toBe("1 minute ago");
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5 minutes ago");
    expect(formatRelativeTime(now - 3_600_000, now)).toBe("1 hour ago");
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe("3 hours ago");
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe("2 days ago");
  });
  it("treats future timestamps as just now", () => {
    expect(formatRelativeTime(now + 5000, now)).toBe("just now");
  });
});
