import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().max(500).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
});

export type IngredientFormValues = z.infer<typeof ingredientSchema>;

export const unitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  abbreviation: z.string().min(1, "Abbreviation is required").max(20),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
