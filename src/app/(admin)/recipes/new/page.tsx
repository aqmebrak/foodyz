import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAllIngredients, getAllTags, getAllUnits } from "@/actions/recipe";
import { RecipeForm } from "@/components/admin/RecipeForm";

export const metadata: Metadata = { title: "New recipe" };

export default async function NewRecipePage() {
  const [tags, ingredients, units] = await Promise.all([
    getAllTags(),
    getAllIngredients(),
    getAllUnits(),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 md:px-8 md:py-8">
      <header className="mb-4 flex items-center gap-2">
        <Link
          href="/recipes"
          aria-label="Back to recipes"
          className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-steam"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">New recipe</h1>
      </header>

      <RecipeForm tags={tags} ingredients={ingredients} units={units} />
    </div>
  );
}
