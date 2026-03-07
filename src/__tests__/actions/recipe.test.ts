import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRecipe, deleteRecipe, updateRecipe } from "@/actions/recipe";

vi.mock("@/lib/db", () => ({
  db: {
    recipe: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");
const { redirect } = await import("next/navigation");

const validRecipe = {
  title: "Pasta Carbonara",
  slug: "pasta-carbonara",
  categoryId: "cat-1",
  difficulty: "EASY" as const,
  prepTime: 10,
  cookTime: 20,
  servings: 4,
  instructions: "Cook pasta.\n\nMix eggs and cheese.",
  published: false,
  description: undefined,
  featuredImage: undefined,
  ingredients: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createRecipe", () => {
  it("returns error on invalid input", async () => {
    const result = await createRecipe({
      ...validRecipe,
      title: "", // required — should fail
    });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.recipe.create).not.toHaveBeenCalled();
  });

  it("calls db.recipe.create on valid input", async () => {
    vi.mocked(db.recipe.create).mockResolvedValueOnce({} as never);
    await createRecipe(validRecipe);
    expect(db.recipe.create).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/admin/recipes");
  });

  it("returns error when db.recipe.create throws", async () => {
    vi.mocked(db.recipe.create).mockRejectedValueOnce(new Error("unique constraint"));
    const result = await createRecipe(validRecipe);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("updateRecipe", () => {
  it("returns error on invalid input", async () => {
    const result = await updateRecipe("id-1", { ...validRecipe, slug: "!!bad slug!!" });
    expect(result).toEqual({ error: expect.any(String) });
    expect(db.recipe.update).not.toHaveBeenCalled();
  });

  it("calls db.recipe.update on valid input", async () => {
    vi.mocked(db.recipe.update).mockResolvedValueOnce({} as never);
    await updateRecipe("id-1", validRecipe);
    expect(db.recipe.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "id-1" } })
    );
  });

  it("returns error when db throws", async () => {
    vi.mocked(db.recipe.update).mockRejectedValueOnce(new Error("not found"));
    const result = await updateRecipe("id-1", validRecipe);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe("deleteRecipe", () => {
  it("calls db.recipe.delete with the given id", async () => {
    vi.mocked(db.recipe.delete).mockResolvedValueOnce({} as never);
    await deleteRecipe("id-1");
    expect(db.recipe.delete).toHaveBeenCalledWith({ where: { id: "id-1" } });
  });

  it("returns error when db throws", async () => {
    vi.mocked(db.recipe.delete).mockRejectedValueOnce(new Error("foreign key"));
    const result = await deleteRecipe("id-1");
    expect(result).toEqual({ error: expect.any(String) });
  });
});
