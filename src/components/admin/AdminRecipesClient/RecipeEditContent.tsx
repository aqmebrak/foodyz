import { Loader2 } from "lucide-react";

import { RecipeForm } from "@/components/admin/RecipeForm";
import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";

import { buildDefaultValues, type SelectedRecipe } from "./types";

interface RecipeEditContentProps {
  loading: boolean;
  recipe: SelectedRecipe | null;
  recipeId: string | null;
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
}

export function RecipeEditContent({ loading, recipe, recipeId, tags, ingredients, units }: RecipeEditContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!recipe || !recipeId) return null;

  return (
    <RecipeForm
      key={recipeId}
      tags={tags}
      ingredients={ingredients}
      units={units}
      defaultValues={buildDefaultValues(recipe)}
      recipeId={recipeId}
    />
  );
}
