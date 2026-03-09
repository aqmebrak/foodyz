import { beforeEach,describe, expect, it, vi } from "vitest";

import { createIngredient, deleteIngredient, updateIngredient } from "@/actions/ingredient";

vi.mock("@/lib/db", () => ({
  db: {
    ingredient: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");

const validIngredient = {
  name: "Eggs",
  slug: "eggs",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createIngredient", () => {
  it("returns error for empty name", async () => {
    const result = await createIngredient({ ...validIngredient, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.ingredient.create).not.toHaveBeenCalled();
  });

  it("returns error for invalid slug", async () => {
    const result = await createIngredient({ ...validIngredient, slug: "Bad Slug!" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.ingredient.create).not.toHaveBeenCalled();
  });

  it("calls db.ingredient.create and returns ingredient on valid input", async () => {
    const mockCreated = { id: "ing-1", name: "Eggs", slug: "eggs" };
    vi.mocked(db.ingredient.create).mockResolvedValueOnce(mockCreated as never);
    const result = await createIngredient(validIngredient);
    expect(db.ingredient.create).toHaveBeenCalledOnce();
    expect(result).toEqual({ ingredient: { id: "ing-1", name: "Eggs" } });
  });

  it("returns error when db throws (duplicate slug)", async () => {
    vi.mocked(db.ingredient.create).mockRejectedValueOnce(new Error("unique constraint"));
    const result = await createIngredient(validIngredient);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("updateIngredient", () => {
  it("calls db.ingredient.update with correct id", async () => {
    vi.mocked(db.ingredient.update).mockResolvedValueOnce({} as never);
    await updateIngredient("ing-1", validIngredient);
    expect(db.ingredient.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ing-1" } })
    );
  });

  it("returns error on invalid data (empty name)", async () => {
    const result = await updateIngredient("ing-1", { ...validIngredient, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.ingredient.update).not.toHaveBeenCalled();
  });

  it("returns error when db throws", async () => {
    vi.mocked(db.ingredient.update).mockRejectedValueOnce(new Error("not found"));
    const result = await updateIngredient("ing-1", validIngredient);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("deleteIngredient", () => {
  it("calls db.ingredient.delete with the given id", async () => {
    vi.mocked(db.ingredient.delete).mockResolvedValueOnce({} as never);
    await deleteIngredient("ing-1");
    expect(db.ingredient.delete).toHaveBeenCalledWith({ where: { id: "ing-1" } });
  });

  it("returns error when db throws (ingredient in use)", async () => {
    vi.mocked(db.ingredient.delete).mockRejectedValueOnce(new Error("foreign key constraint"));
    const result = await deleteIngredient("ing-1");
    expect(result).toEqual({ error: expect.any(String) });
  });
});
