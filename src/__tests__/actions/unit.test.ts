import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUnit, deleteUnit, updateUnit } from "@/actions/unit";

vi.mock("@/lib/db", () => ({
  db: {
    unit: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");

const validUnit = {
  name: "Gram",
  abbreviation: "g",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createUnit", () => {
  it("returns error for empty name", async () => {
    const result = await createUnit({ ...validUnit, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.unit.create).not.toHaveBeenCalled();
  });

  it("returns error for empty abbreviation", async () => {
    const result = await createUnit({ ...validUnit, abbreviation: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.unit.create).not.toHaveBeenCalled();
  });

  it("calls db.unit.create on valid input", async () => {
    vi.mocked(db.unit.create).mockResolvedValueOnce({} as never);
    const result = await createUnit(validUnit);
    expect(db.unit.create).toHaveBeenCalledWith({ data: validUnit });
    expect(result).toBeUndefined();
  });

  it("returns error when db throws (duplicate name/abbreviation)", async () => {
    vi.mocked(db.unit.create).mockRejectedValueOnce(new Error("unique constraint"));
    const result = await createUnit(validUnit);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("updateUnit", () => {
  it("calls db.unit.update with correct id", async () => {
    vi.mocked(db.unit.update).mockResolvedValueOnce({} as never);
    await updateUnit("unit-1", validUnit);
    expect(db.unit.update).toHaveBeenCalledWith({
      where: { id: "unit-1" },
      data: validUnit,
    });
  });

  it("returns error on invalid data (empty abbreviation)", async () => {
    const result = await updateUnit("unit-1", { ...validUnit, abbreviation: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.unit.update).not.toHaveBeenCalled();
  });

  it("returns error when db throws", async () => {
    vi.mocked(db.unit.update).mockRejectedValueOnce(new Error("not found"));
    const result = await updateUnit("unit-1", validUnit);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("deleteUnit", () => {
  it("calls db.unit.delete with the given id", async () => {
    vi.mocked(db.unit.delete).mockResolvedValueOnce({} as never);
    await deleteUnit("unit-1");
    expect(db.unit.delete).toHaveBeenCalledWith({ where: { id: "unit-1" } });
  });

  it("returns error when db throws (unit in use)", async () => {
    vi.mocked(db.unit.delete).mockRejectedValueOnce(new Error("foreign key constraint"));
    const result = await deleteUnit("unit-1");
    expect(result).toEqual({ error: expect.any(String) });
  });
});
