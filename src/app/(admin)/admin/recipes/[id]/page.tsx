import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllCategories,
  getAllIngredients,
  getAllUnits,
  getRecipeForAdmin,
} from "@/actions/recipe";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeForAdmin(id);
  return { title: recipe ? `Edit: ${recipe.title}` : "Edit Recipe" };
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const [recipe, categories, ingredients, units] = await Promise.all([
    getRecipeForAdmin(id),
    getAllCategories(),
    getAllIngredients(),
    getAllUnits(),
  ]);

  if (!recipe) notFound();

  const defaultValues = {
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    featuredImage: recipe.featuredImage ?? "",
    categoryId: recipe.categoryId,
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    published: recipe.published,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      unitId: ri.unitId ?? "",
      quantity: ri.quantity,
      notes: ri.notes ?? "",
    })),
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
          <Link href="/admin/recipes">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Recipes
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit recipe</h1>
        <p className="text-sm text-gray-500 mt-0.5">{recipe.title}</p>
      </div>

      <RecipeForm
        categories={categories}
        ingredients={ingredients}
        units={units}
        defaultValues={defaultValues}
        recipeId={recipe.id}
      />
    </div>
  );
}
