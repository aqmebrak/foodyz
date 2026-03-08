import type { Metadata } from "next";

import { getAllCategories, getAllIngredients, getAllRecipesAdmin, getAllUnits } from "@/actions/recipe";
import { AdminRecipesClient } from "@/components/admin/AdminRecipesClient";

export const metadata: Metadata = { title: "Recipes — Admin" };

export default async function AdminRecipesPage() {
  const [recipes, categories, ingredients, units] = await Promise.all([
    getAllRecipesAdmin(),
    getAllCategories(),
    getAllIngredients(),
    getAllUnits(),
  ]);

  return (
    <AdminRecipesClient
      recipes={recipes}
      categories={categories}
      ingredients={ingredients}
      units={units}
    />
  );
}
