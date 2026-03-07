import type { RecipeFormValues } from "@/lib/validations/recipe";

export interface Category {
  id: string;
  name: string;
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
  categories: Category[];
  ingredients: Ingredient[];
  units: Unit[];
  defaultValues?: Partial<RecipeFormValues>;
  recipeId?: string;
}
