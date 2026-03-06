import { getPublishedRecipes } from "@/actions/recipe";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse all published recipes.",
};

export default async function RecipesPage() {
  const recipes = await getPublishedRecipes();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <p className="mt-1 text-gray-500">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} to explore
        </p>
      </div>

      <RecipeGrid recipes={recipes} emptyMessage="No recipes published yet." />
    </div>
  );
}
