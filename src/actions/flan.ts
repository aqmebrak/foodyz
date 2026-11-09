"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";
import { expandMapsShortUrl, isShortMapsUrl } from "@/lib/maps-url";

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

const idSchema = z.string().min(1, "Invalid id");

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

export async function getPastryLocations() {
  return db.pastryLocation.findMany({ orderBy: { name: "asc" } });
}

/** Every shop with its flans (tried or not), for the shop editing view. */
export async function getPastryLocationsWithFlans() {
  return db.pastryLocation.findMany({
    orderBy: { name: "asc" },
    include: {
      flans: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, tried: true, rating: true },
      },
    },
  });
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

  revalidatePath("/flans");
  revalidatePath("/flan");
  revalidatePath("/shops");
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

  revalidatePath("/flans");
  revalidatePath("/flan");
  revalidatePath("/shops");
}

export async function deleteFlan(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? "Invalid id" };

  await db.flan.delete({ where: { id } });
  revalidatePath("/flans");
  revalidatePath("/flan");
  revalidatePath("/shops");
}

// ---------------------------------------------------------------------------
// PastryLocation mutations
// ---------------------------------------------------------------------------

export async function createPastryLocation(data: PastryLocationFormValues) {
  const parsed = pastryLocationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const mapsUrl = isShortMapsUrl(parsed.data.mapsUrl)
    ? await expandMapsShortUrl(parsed.data.mapsUrl)
    : parsed.data.mapsUrl;

  const location = await db.pastryLocation.create({
    data: {
      name: parsed.data.name,
      mapsUrl,
    },
  });

  revalidatePath("/flans");
  revalidatePath("/flan");
  revalidatePath("/shops");
  return { location };
}

export async function updatePastryLocationUrl(id: string, mapsUrl: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? "Invalid id" };
  const parsed = pastryLocationSchema.shape.mapsUrl.safeParse(mapsUrl.trim());
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const url = isShortMapsUrl(parsed.data) ? await expandMapsShortUrl(parsed.data) : parsed.data;

  try {
    const location = await db.pastryLocation.update({ where: { id }, data: { mapsUrl: url } });
    revalidatePath("/flans");
    revalidatePath("/flan");
    revalidatePath("/shops");
    return { location };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update the shop. It may have been deleted." };
  }
}

export async function deletePastryLocation(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? "Invalid id" };

  await db.pastryLocation.delete({ where: { id } });
  revalidatePath("/flans");
  revalidatePath("/flan");
  revalidatePath("/shops");
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
