import type { getRecipeForAdmin } from "@/actions/recipe";
import type { RecipeFormValues } from "@/lib/validations/recipe";

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
}

export type SelectedRecipe = NonNullable<Awaited<ReturnType<typeof getRecipeForAdmin>>>;

export const difficultyBadge: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};

export const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-gray-700";

export function buildDefaultValues(recipe: SelectedRecipe): Partial<RecipeFormValues> {
  return {
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    featuredImage: recipe.featuredImage ?? "",
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    published: recipe.published,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      unitId: ri.unitId ?? "",
      quantity: ri.quantity,
      notes: ri.notes ?? "",
    })),
    tags: recipe.tags.map((rt) => rt.tag.name),
  };
}
