import { db } from "@/lib/db";

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
        include: {
          ingredient: true,
          unit: true,
        },
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
  return db.category.findUnique({
    where: { slug },
  });
}

export async function getAllPublishedSlugs() {
  return db.recipe.findMany({
    where: { published: true },
    select: { slug: true },
  });
}

export async function getAllCategorySlugs() {
  return db.category.findMany({
    select: { slug: true },
  });
}
