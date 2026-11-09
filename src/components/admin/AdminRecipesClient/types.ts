import type { getRecipeForAdmin } from "@/actions/recipe";

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  featuredImage: string | null;
  tags: Array<{ tag: { name: string; slug: string } }>;
  ingredients: Array<{ ingredient: { name: string } }>;
}

export type SelectedRecipe = NonNullable<Awaited<ReturnType<typeof getRecipeForAdmin>>>;

export const difficultyBadge: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};
