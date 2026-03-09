import type { Metadata } from "next";

import { getAllIngredients, getAllRecipesAdmin, getAllTags, getAllUnits } from "@/actions/recipe";
import { AdminRecipesClient } from "@/components/admin/AdminRecipesClient";

export const metadata: Metadata = { title: "Recipes — Admin" };

export default async function AdminRecipesPage() {
  const [recipes, tags, ingredients, units] = await Promise.all([
    getAllRecipesAdmin(),
    getAllTags(),
    getAllIngredients(),
    getAllUnits(),
  ]);

  return (
    <AdminRecipesClient
      recipes={recipes}
      tags={tags}
      ingredients={ingredients}
      units={units}
    />
  );
}
