import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { RecipeEditContent } from "./RecipeEditContent";
import type { SelectedRecipe } from "./types";

interface RecipeEditModalProps {
  open: boolean;
  recipe: SelectedRecipe | null;
  recipeId: string | null;
  loading: boolean;
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
  onClose: () => void;
}

export function RecipeEditModal({ open, recipe, recipeId, loading, tags, ingredients, units, onClose }: RecipeEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-full sm:max-w-lg h-[92dvh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-none px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">Edit recipe</DialogTitle>
              {recipe && <p className="text-sm text-gray-500 mt-0.5">{recipe.title}</p>}
            </div>
            {recipe?.published && (
              <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700 shrink-0">
                <Link href={`/recipes/${recipe.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <RecipeEditContent
            loading={loading}
            recipe={recipe}
            recipeId={recipeId}
            tags={tags}
            ingredients={ingredients}
            units={units}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
