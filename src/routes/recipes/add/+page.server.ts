import { db } from '$lib/server/db';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	recipes,
	instructions,
	recipeIngredients,
	ingredients,
	units
} from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { validationSchemaRecipe } from '../validationSchemaRecipe';

export const load: PageServerLoad = async () => {
	try {
		const [ingredientsList, unitsList, form] = await Promise.all([
			db.select().from(ingredients).orderBy(ingredients.name),
			db.select().from(units),
			superValidate(zod(validationSchemaRecipe))
		]);

		return {
			ingredients: ingredientsList,
			units: unitsList,
			form
		};
	} catch (error) {
		console.error('Failed to load recipe data:', error);
		// In a load function, throwing an error will trigger SvelteKit's error boundary
		throw error;
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(validationSchemaRecipe));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const result = await db.transaction(async (tx) => {
				// 1. Insert the recipe
				const [insertedRecipe] = await tx
					.insert(recipes)
					.values({
						name: form.data.name,
						notes: form.data.notes,
						prepTime: 15,
						cookTime: 12,
						servings: 24
					})
					.returning();

				// 3. Link the ingredient to the recipe
				const insertedIngredients = await Promise.all(
					form.data.ingredients.map(
						async (ingr) =>
							await tx
								.insert(recipeIngredients)
								.values({
									recipeId: insertedRecipe.id,
									ingredientId: ingr.id,
									quantity: ingr.quantity.toString(),
									unitId: ingr.unitId
								})
								.returning()
					)
				);

				// 4. Add an instruction
				const insertedInstructions = await Promise.all(
					form.data.instructions.map(
						async (instruc, index) =>
							await tx
								.insert(instructions)
								.values({
									recipeId: insertedRecipe.id,
									description: instruc,
									stepOrder: index
								})
								.returning()
					)
				);

				return { insertedRecipe, insertedIngredients, insertedInstructions };
			});
			// If we get here, the transaction succeeded
			throw redirect(302, `/recipes/${result.insertedRecipe.id}`);
		} catch (error) {
			console.error('Transaction failed:', error);
			// Provide more specific error messages based on error type
			let errorMessage = 'Unknown error occurred';
			if (error instanceof Error) {
				// Check for specific database errors
				if (error.message.includes('unique constraint')) {
					if (error.message.includes('recipes_name_unique'))
						setError(form, 'name', 'A recipe with this name already exists');
				} else {
					errorMessage = error.message;
				}
			}

			return fail(422, {
				form,
				error: errorMessage ? `Failed to create recipe: ${errorMessage}` : undefined
			});
		}
	}
} satisfies Actions;
