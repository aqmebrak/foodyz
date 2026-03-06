"use server";

import { db } from "@/lib/db";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: CategoryFormValues) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.category.create({ data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to create category. The slug may already exist." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.category.update({ where: { id }, data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to update category. The slug may already be taken." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete category. It may still have recipes." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
