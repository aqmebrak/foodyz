import type { RecipeFormValues } from "@/lib/validations/recipe";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface RecipeFormProps {
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
  defaultValues?: Partial<RecipeFormValues>;
  recipeId?: string;
}
