import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category";

vi.mock("@/lib/db", () => ({
  db: {
    category: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");

const validCategory = {
  name: "Italian",
  slug: "italian",
  description: "Italian cuisine",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCategory", () => {
  it("returns error for empty name", async () => {
    const result = await createCategory({ ...validCategory, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.category.create).not.toHaveBeenCalled();
  });

  it("returns error for invalid slug", async () => {
    const result = await createCategory({ ...validCategory, slug: "My Category!" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.category.create).not.toHaveBeenCalled();
  });

  it("calls db.category.create on valid input", async () => {
    vi.mocked(db.category.create).mockResolvedValueOnce({} as never);
    const result = await createCategory(validCategory);
    expect(db.category.create).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it("returns error when db throws (duplicate slug)", async () => {
    vi.mocked(db.category.create).mockRejectedValueOnce(new Error("unique constraint"));
    const result = await createCategory(validCategory);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("updateCategory", () => {
  it("calls db.category.update with correct id", async () => {
    vi.mocked(db.category.update).mockResolvedValueOnce({} as never);
    await updateCategory("cat-1", validCategory);
    expect(db.category.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cat-1" } })
    );
  });

  it("returns error on invalid data", async () => {
    const result = await updateCategory("cat-1", { ...validCategory, name: "" });
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("deleteCategory", () => {
  it("calls db.category.delete with the given id", async () => {
    vi.mocked(db.category.delete).mockResolvedValueOnce({} as never);
    await deleteCategory("cat-1");
    expect(db.category.delete).toHaveBeenCalledWith({ where: { id: "cat-1" } });
  });

  it("returns error when db throws (has recipes)", async () => {
    vi.mocked(db.category.delete).mockRejectedValueOnce(new Error("foreign key constraint"));
    const result = await deleteCategory("cat-1");
    expect(result).toEqual({ error: expect.any(String) });
  });
});
