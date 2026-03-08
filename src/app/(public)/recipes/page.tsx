import type { Metadata } from "next";

import { getPublishedRecipes } from "@/actions/recipe";
import { RecipesClient } from "@/components/recipes/RecipesClient";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse all published recipes.",
};

export default async function RecipesPage() {
  const allRecipes = await getPublishedRecipes();

  return (
    <div className="max-w-6xl mx-auto 2xl:max-w-full 2xl:px-12 px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <p className="mt-1 text-gray-500">
          {allRecipes.length} recipe{allRecipes.length !== 1 ? "s" : ""} to explore
        </p>
      </div>

      <RecipesClient allRecipes={allRecipes} />
    </div>
  );
}
