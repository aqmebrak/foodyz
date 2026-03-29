"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const flanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  locationId: z.string().min(1, "Location is required"),
  rating: z.coerce.number().min(0).max(5),
  tried: z.boolean(),
  triedAt: z.string().optional(),
  photoUrl: z.string().optional(),
  comment: z.string().optional(),
});

const pastryLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mapsUrl: z.string().url("Must be a valid URL"),
});

export type FlanFormValues = z.infer<typeof flanSchema>;
export type PastryLocationFormValues = z.infer<typeof pastryLocationSchema>;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getFlans() {
  return db.flan.findMany({
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTriedFlans() {
  return db.flan.findMany({
    where: { tried: true },
    include: { location: true },
    orderBy: { rating: "desc" },
  });
}

export async function getPastryLocations() {
  return db.pastryLocation.findMany({ orderBy: { name: "asc" } });
}

// ---------------------------------------------------------------------------
// Flan mutations
// ---------------------------------------------------------------------------

export async function createFlan(data: FlanFormValues) {
  const parsed = flanSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await db.flan.create({
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rating: parsed.data.rating,
      tried: parsed.data.tried,
      triedAt: parsed.data.triedAt ? new Date(parsed.data.triedAt) : null,
      photoUrl: parsed.data.photoUrl ?? null,
      comment: parsed.data.comment ?? null,
    },
  });

  revalidatePath("/admin/flans");
  revalidatePath("/flan");
}

export async function updateFlan(id: string, data: FlanFormValues) {
  const parsed = flanSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  await db.flan.update({
    where: { id },
    data: {
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rating: parsed.data.rating,
      tried: parsed.data.tried,
      triedAt: parsed.data.triedAt ? new Date(parsed.data.triedAt) : null,
      photoUrl: parsed.data.photoUrl ?? null,
      comment: parsed.data.comment ?? null,
    },
  });

  revalidatePath("/admin/flans");
  revalidatePath("/flan");
}

export async function deleteFlan(id: string) {
  await db.flan.delete({ where: { id } });
  revalidatePath("/admin/flans");
  revalidatePath("/flan");
}

// ---------------------------------------------------------------------------
// PastryLocation mutations
// ---------------------------------------------------------------------------

export async function createPastryLocation(data: PastryLocationFormValues) {
  const parsed = pastryLocationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const location = await db.pastryLocation.create({
    data: {
      name: parsed.data.name,
      mapsUrl: parsed.data.mapsUrl,
    },
  });

  revalidatePath("/admin/flans");
  return { location };
}

export async function deletePastryLocation(id: string) {
  await db.pastryLocation.delete({ where: { id } });
  revalidatePath("/admin/flans");
}

// ---------------------------------------------------------------------------
// Photo upload
// ---------------------------------------------------------------------------

export async function uploadFlanPhoto(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const blob = await put(`flans/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return { url: blob.url };
}
