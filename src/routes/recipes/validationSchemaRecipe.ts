import { z } from 'zod';

export const validationSchemaRecipe = z.object({
	// string and no empyy string allowed
	name: z.string().nonempty(),
	notes: z.string().optional(),
	prepTime: z.number().optional(),
	cookTime: z.number().optional(),
	servings: z.number().optional(),
	ingredients: z
		.array(
			z.object({
				name: z.string(),
				id: z.number(),
				quantity: z.number(),
				unitId: z.number()
			})
		)
		.min(1, 'Ajouter au moins un ingrédient'),
	instructions: z.array(z.string()).min(1, 'Ajouter au moins une instruction')
});
