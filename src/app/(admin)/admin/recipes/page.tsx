import type { Metadata } from "next";

import { getAllRecipesAdmin } from "@/actions/recipe";
import { AdminRecipesClient } from "@/components/admin/AdminRecipesClient";

export const metadata: Metadata = { title: "Recipes — Admin" };

export default async function AdminRecipesPage() {
  const recipes = await getAllRecipesAdmin();
  return <AdminRecipesClient recipes={recipes} />;
}
