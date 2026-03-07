import { z } from "zod";

export const ingredientRowSchema = z.object({
  ingredientId: z.string().min(1, "Select an ingredient"),
  unitId: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  notes: z.string().optional(),
});

export const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only"
    ),
  description: z.string().max(1000).optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"] as const),
  prepTime: z.coerce.number().int().min(1, "Required"),
  cookTime: z.coerce.number().int().min(0),
  servings: z.coerce.number().int().min(1, "Required"),
  published: z.boolean().default(false),
  instructions: z.string().min(1, "Instructions are required"),
  ingredients: z.array(ingredientRowSchema).default([]),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
