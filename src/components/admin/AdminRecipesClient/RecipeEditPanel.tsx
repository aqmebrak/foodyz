import { ExternalLink, X } from "lucide-react";
import Link from "next/link";

import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";
import { Button } from "@/components/ui/button";

import { RecipeEditContent } from "./RecipeEditContent";
import type { SelectedRecipe } from "./types";

interface RecipeEditPanelProps {
  recipe: SelectedRecipe | null;
  recipeId: string;
  loading: boolean;
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
  onClose: () => void;
}

export function RecipeEditPanel({ recipe, recipeId, loading, tags, ingredients, units, onClose }: RecipeEditPanelProps) {
  return (
    <div className="hidden lg:flex flex-col flex-1 min-w-0">
      <div className="flex items-start justify-between mb-4 flex-none">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit recipe</h2>
          {recipe && <p className="text-sm text-gray-500 mt-0.5">{recipe.title}</p>}
        </div>
        <div className="flex items-center gap-1">
          {recipe?.published && (
            <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700">
              <Link href={`/recipes/${recipe.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-1" />
                View on site
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <RecipeEditContent
        loading={loading}
        recipe={recipe}
        recipeId={recipeId}
        tags={tags}
        ingredients={ingredients}
        units={units}
      />
    </div>
  );
}
