import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getAllIngredients, getAllTags, getAllUnits } from "@/actions/recipe";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "New Recipe — Admin" };

export default async function NewRecipePage() {
  const [tags, ingredients, units] = await Promise.all([
    getAllTags(),
    getAllIngredients(),
    getAllUnits(),
  ]);

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/recipes">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Recipes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New recipe</h1>
      </div>

      <RecipeForm
        tags={tags}
        ingredients={ingredients}
        units={units}
      />
    </div>
  );
}
