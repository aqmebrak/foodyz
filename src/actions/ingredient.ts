"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { type IngredientFormValues,ingredientSchema } from "@/lib/validations/category";

export async function getIngredients() {
  return db.ingredient.findMany({ orderBy: { name: "asc" } });
}

export async function createIngredient(data: IngredientFormValues) {
  const parsed = ingredientSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.ingredient.create({ data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to create ingredient. The slug may already exist." };
  }

  revalidatePath("/admin/ingredients");
}

export async function updateIngredient(id: string, data: IngredientFormValues) {
  const parsed = ingredientSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.ingredient.update({ where: { id }, data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to update ingredient. The slug may already be taken." };
  }

  revalidatePath("/admin/ingredients");
}

export async function deleteIngredient(id: string) {
  try {
    await db.ingredient.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete ingredient. It may be in use by recipes." };
  }

  revalidatePath("/admin/ingredients");
}
