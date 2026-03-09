import type { Difficulty } from "@prisma/client";

import { RecipeCard } from "@/components/recipes/RecipeCard";

interface RecipeGridProps {
  recipes: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    featuredImage: string | null;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: Difficulty;
    tags: Array<{ tag: { name: string; slug: string } }>;
  }>;
  emptyMessage?: string;
}

export function RecipeGrid({
  recipes,
  emptyMessage = "No recipes found.",
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
