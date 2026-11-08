import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAllIngredients,
  getAllTags,
  getAllUnits,
  getRecipeForAdminBySlug,
} from "@/actions/recipe";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { GuardedBackLink } from "@/components/admin/RecipeForm/GuardedBackLink";
import { buildDefaultValues } from "@/components/admin/RecipeForm/utils";

export const metadata: Metadata = { title: "Edit recipe" };

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [recipe, tags, ingredients, units] = await Promise.all([
    getRecipeForAdminBySlug(slug),
    getAllTags(),
    getAllIngredients(),
    getAllUnits(),
  ]);
  if (!recipe) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 md:px-8 md:py-8">
      <header className="mb-4 flex items-center gap-2">
        <GuardedBackLink
          href={`/recipes/${recipe.slug}`}
          aria-label="Back to recipe"
          className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-steam"
        >
          <ChevronLeft className="size-6" />
        </GuardedBackLink>
        <h1 className="font-display text-2xl font-bold text-ink">Edit recipe</h1>
      </header>

      <RecipeForm
        key={recipe.id}
        tags={tags}
        ingredients={ingredients}
        units={units}
        defaultValues={buildDefaultValues(recipe)}
        recipeId={recipe.id}
      />
    </div>
  );
}
