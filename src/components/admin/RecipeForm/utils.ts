import type { getRecipeForAdmin } from "@/actions/recipe";
import type { RecipeFormValues } from "@/lib/validations/recipe";

type SelectedRecipe = NonNullable<Awaited<ReturnType<typeof getRecipeForAdmin>>>;

export const difficultyOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export const DEFAULT_FORM_VALUES = {
  title: "",
  slug: "",
  description: "",
  featuredImage: "",
  difficulty: "EASY" as const,
  prepTime: 15,
  cookTime: 30,
  servings: 4,
  published: false,
  instructions: "",
  ingredients: [],
  tags: [],
};

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
