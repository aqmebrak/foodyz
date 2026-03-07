"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { type UnitFormValues,unitSchema } from "@/lib/validations/category";

export async function getUnits() {
  return db.unit.findMany({ orderBy: { name: "asc" } });
}

export async function createUnit(data: UnitFormValues) {
  const parsed = unitSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.unit.create({ data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to create unit. Name or abbreviation may already exist." };
  }

  revalidatePath("/admin/units");
}

export async function updateUnit(id: string, data: UnitFormValues) {
  const parsed = unitSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  try {
    await db.unit.update({ where: { id }, data: parsed.data });
  } catch (e) {
    console.error(e);
    return { error: "Failed to update unit. Name or abbreviation may already be taken." };
  }

  revalidatePath("/admin/units");
}

export async function deleteUnit(id: string) {
  try {
    await db.unit.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete unit. It may be in use by recipes." };
  }

  revalidatePath("/admin/units");
}
