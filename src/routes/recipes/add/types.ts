export type IngredientDraft = {
	name: string;
	id: number | null;
	quantity: number;
	unitId: number | null;
};

export type FormValues = {
	name: string;
	notes: string;
	ingredients: IngredientDraft[];
	instructions: string[];
	prepTime: number | null;
	cookTime: number | null;
	servings: number | null;
};
