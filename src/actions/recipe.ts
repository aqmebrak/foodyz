"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { type RecipeFormValues,recipeSchema } from "@/lib/validations/recipe";

// ---------------------------------------------------------------------------
// Public reads (no auth required)
// ---------------------------------------------------------------------------

export async function getPublishedRecipes() {
  return db.recipe.findMany({
    where: { published: true },
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeBySlug(slug: string) {
  return db.recipe.findUnique({
    where: { slug, published: true },
    include: {
      ingredients: {
        include: { ingredient: true, unit: true },
        orderBy: { order: "asc" },
      },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getRecipesByTag(tagSlug: string) {
  return db.recipe.findMany({
    where: {
      published: true,
      tags: { some: { tag: { slug: tagSlug } } },
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllPublishedSlugs() {
  return db.recipe.findMany({
    where: { published: true },
    select: { slug: true },
  });
}

// ---------------------------------------------------------------------------
// Admin reads
// ---------------------------------------------------------------------------

export async function getAllRecipesAdmin() {
  return db.recipe.findMany({
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeForAdmin(id: string) {
  return db.recipe.findUnique({
    where: { id },
    include: {
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
  return db.ingredient.findMany({
    orderBy: [{ recipes: { _count: "desc" } }, { name: "asc" }],
  });
}

export async function getAllUnits() {
  return db.unit.findMany({ orderBy: { name: "asc" } });
}

export async function getAllTags() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createRecipe(data: RecipeFormValues) {
  const parsed = recipeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const { ingredients, tags, description, featuredImage, ...rest } = parsed.data;

  try {
    const recipe = await db.recipe.create({
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

    // Upsert and connect tags
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      const tag = await db.tag.upsert({
        where: { slug: tagSlug },
        create: { name: tagName, slug: tagSlug },
        update: {},
      });
      await db.recipeTag.create({
        data: { recipeId: recipe.id, tagId: tag.id },
      });
    }
  } catch (e) {
    console.error(e);
    return { error: "Failed to create recipe. The slug may already exist." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function updateRecipe(id: string, data: RecipeFormValues) {
  const parsed = recipeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const { ingredients, tags, description, featuredImage, ...rest } = parsed.data;

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

    // Replace tags: delete all, re-create
    await db.recipeTag.deleteMany({ where: { recipeId: id } });
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      const tag = await db.tag.upsert({
        where: { slug: tagSlug },
        create: { name: tagName, slug: tagSlug },
        update: {},
      });
      await db.recipeTag.create({
        data: { recipeId: id, tagId: tag.id },
      });
    }
  } catch (e) {
    console.error(e);
    return { error: "Failed to update recipe. The slug may already be taken." };
  }

  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${parsed.data.slug}`);
  revalidatePath("/recipes");
  redirect("/recipes");
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
  revalidatePath("/recipes");
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
