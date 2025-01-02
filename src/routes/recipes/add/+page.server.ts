import { db } from '$lib/server/db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	recipes,
	instructions,
	recipeIngredients,
	ingredients,
	units
} from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { validationSchemaRecipe } from '../validationSchemaRecipe';

export const load: PageServerLoad = async () => {
	const list = await db.select().from(ingredients).orderBy(ingredients.name);
	const unitsList = await db.select().from(units);
	const form = await superValidate(zod(validationSchemaRecipe));

	return {
		ingredients: list,
		units: unitsList,
		form
	};
};

export const actions: Actions = {
	default: async ({ request }: RequestEvent) => {
		const form = await superValidate(request, zod(validationSchemaRecipe));
		console.log(form);

		if (!form.valid) {
			return fail(400, { form });
		}

		let result = null;
		try {
			// Start a transaction to ensure all operations succeed or fail together
			result = await db.transaction(async (tx) => {
				try {
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
					const insertedIngredients = form.data.ingredients.map(
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
					);

					// 4. Add an instruction
					const insertedInstructions = form.data.instructions.map(
						async (instruc, index) =>
							await tx
								.insert(instructions)
								.values({
									recipeId: insertedRecipe.id,
									description: instruc,
									stepOrder: index
								})
								.returning()
					);

					return { insertedRecipe, insertedIngredients, insertedInstructions };
				} catch (e: unknown) {
					console.log(e, e?.message);
					tx.rollback();
					// return new Response(JSON.stringify((e as Error)?.message), { status: 400 });
				}
			});
		} catch (error: unknown) {
			return fail(422, { form, error: 'not found' });
		}
		if (result) {
			redirect(302, '/recipes/' + result?.insertedRecipe.id);
		} else {
			return fail(422, { form, error: 'not found' });
		}
	}
} satisfies Actions;
