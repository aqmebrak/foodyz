"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";
import { type RecipeFormValues,recipeSchema } from "@/lib/validations/recipe";

// ---------------------------------------------------------------------------
// Public reads (no auth required)
// ---------------------------------------------------------------------------

export async function getPublishedRecipes() {
  return db.recipe.findMany({
    where: { published: true },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeBySlug(slug: string) {
  return db.recipe.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      ingredients: {
        include: { ingredient: true, unit: true },
        orderBy: { order: "asc" },
      },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getRecipesByCategory(categorySlug: string) {
  return db.recipe.findMany({
    where: { published: true, category: { slug: categorySlug } },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

export async function getAllPublishedSlugs() {
  return db.recipe.findMany({
    where: { published: true },
    select: { slug: true },
  });
}

export async function getAllCategorySlugs() {
  return db.category.findMany({ select: { slug: true } });
}

// ---------------------------------------------------------------------------
// Admin reads
// ---------------------------------------------------------------------------

export async function getAllRecipesAdmin() {
  return db.recipe.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeForAdmin(id: string) {
  return db.recipe.findUnique({
    where: { id },
    include: {
      category: true,
      ingredients: {
        include: { ingredient: true, unit: true },
        orderBy: { order: "asc" },
      },
      tags: { include: { tag: true } },
    },
  });
}

export async function getAllCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function getAllIngredients() {
  return db.ingredient.findMany({ orderBy: { name: "asc" } });
}

export async function getAllUnits() {
  return db.unit.findMany({ orderBy: { name: "asc" } });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createRecipe(data: RecipeFormValues) {
  const parsed = recipeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const { ingredients, description, featuredImage, ...rest } = parsed.data;

  try {
    await db.recipe.create({
      data: {
        ...rest,
        description: description || null,
        featuredImage: featuredImage || null,
        ingredients: {
          create: ingredients.map((ing, i) => ({
            ingredientId: ing.ingredientId,
            unitId: ing.unitId || null,
            quantity: ing.quantity,
            notes: ing.notes || null,
            order: i,
          })),
        },
      },
    });
  } catch (e) {
    console.error(e);
    return { error: "Failed to create recipe. The slug may already exist." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/admin/recipes");
  redirect("/admin/recipes");
}

export async function updateRecipe(id: string, data: RecipeFormValues) {
  const parsed = recipeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const { ingredients, description, featuredImage, ...rest } = parsed.data;

  try {
    await db.recipe.update({
      where: { id },
      data: {
        ...rest,
        description: description || null,
        featuredImage: featuredImage || null,
        ingredients: {
          deleteMany: {},
          create: ingredients.map((ing, i) => ({
            ingredientId: ing.ingredientId,
            unitId: ing.unitId || null,
            quantity: ing.quantity,
            notes: ing.notes || null,
            order: i,
          })),
        },
      },
    });
  } catch (e) {
    console.error(e);
    return { error: "Failed to update recipe. The slug may already be taken." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${parsed.data.slug}`);
  revalidatePath("/admin/recipes");
  redirect("/admin/recipes");
}

export async function deleteRecipe(id: string) {
  try {
    await db.recipe.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete recipe." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/admin/recipes");
}

export async function uploadRecipeImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `recipes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const blob = await put(filename, file, { access: "public" });
    return { path: blob.url };
  } catch (e) {
    console.error(e);
    return { error: "Failed to upload image." };
  }
}
