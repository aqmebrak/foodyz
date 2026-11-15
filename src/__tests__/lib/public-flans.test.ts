import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPublicFlans } from "@/lib/public-flans";

vi.mock("@/lib/db", () => ({
  db: { flan: { findMany: vi.fn() } },
}));

const { db } = await import("@/lib/db");

describe("getPublicFlans", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries flans with explicit select, newest first", async () => {
    vi.mocked(db.flan.findMany).mockResolvedValue([] as never);
    await getPublicFlans();
    expect(db.flan.findMany).toHaveBeenCalledTimes(1);
    const arg = vi.mocked(db.flan.findMany).mock.calls[0][0] as {
      select: Record<string, unknown>;
      orderBy: unknown;
    };
    expect(arg.orderBy).toEqual({ createdAt: "desc" });
    expect(Object.keys(arg.select).sort()).toEqual(
      ["comment", "id", "location", "name", "photoUrl", "rating", "tried", "triedAt"],
    );
    expect(arg.select.location).toEqual({ select: { name: true, mapsUrl: true } });
  });

  it("returns rows unchanged", async () => {
    const rows = [{ id: "1", name: "Flan" }];
    vi.mocked(db.flan.findMany).mockResolvedValue(rows as never);
    expect(await getPublicFlans()).toBe(rows);
  });

  it("returns [] when none", async () => {
    vi.mocked(db.flan.findMany).mockResolvedValue([] as never);
    expect(await getPublicFlans()).toEqual([]);
  });
});
