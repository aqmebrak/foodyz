import type { Metadata } from "next";

import { getIngredients } from "@/actions/ingredient";
import { IngredientsClient } from "@/components/admin/IngredientsClient";

export const metadata: Metadata = { title: "Ingredients — Admin" };

export default async function AdminIngredientsPage() {
  const ingredients = await getIngredients();
  return <IngredientsClient ingredients={ingredients} />;
}
