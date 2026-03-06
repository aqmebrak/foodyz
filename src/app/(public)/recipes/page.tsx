import { getPublishedRecipes } from "@/actions/recipe";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { Pagination } from "@/components/shared/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse all published recipes.",
};

const PER_PAGE = 12;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function RecipesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const allRecipes = await getPublishedRecipes();
  const totalPages = Math.max(1, Math.ceil(allRecipes.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const recipes = allRecipes.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <p className="mt-1 text-gray-500">
          {allRecipes.length} recipe{allRecipes.length !== 1 ? "s" : ""} to explore
        </p>
      </div>

      <RecipeGrid recipes={recipes} emptyMessage="No recipes published yet." />

      <Pagination page={safePage} totalPages={totalPages} basePath="/recipes" />
    </div>
  );
}
