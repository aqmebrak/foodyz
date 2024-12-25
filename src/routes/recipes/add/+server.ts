import { db } from '$lib/server/db';
import { recipes, instructions, recipeIngredients } from '$lib/server/db/schema';

export async function POST({ request }) {
	const data = await request.json();

	if (data) {
		const {
			name: nameDraft,
			notes,
			ingredients: ingredientsDraft,
			instructions: instructionsDraft
		}: {
			name: string;
			notes: string;
			prepTime: number;
			cookTime: number;
			servings: number;
			ingredients: { id: number; unitId: number; quantity: number }[];
			instructions: string[];
		} = data;

		try {
			// Start a transaction to ensure all operations succeed or fail together
			const result = await db.transaction(async (tx) => {
				try {
					// 1. Insert the recipe
					const [insertedRecipe] = await tx
						.insert(recipes)
						.values({
							name: nameDraft,
							notes,
							prepTime: 15,
							cookTime: 12,
							servings: 24
						})
						.returning();

					// 3. Link the ingredient to the recipe
					const insertedIngredients = ingredientsDraft.map(async (ingr) => {
						return await tx
							.insert(recipeIngredients)
							.values({
								recipeId: insertedRecipe.id,
								ingredientId: ingr.id,
								quantity: ingr.quantity.toString(),
								unitId: ingr.unitId
							})
							.returning();
					});

					// 4. Add an instruction
					const insertedInstructions = instructionsDraft.map(async (instruc, index) => {
						return await tx
							.insert(instructions)
							.values({
								recipeId: insertedRecipe.id,
								description: instruc,
								stepOrder: index
							})
							.returning();
					});

					return { insertedRecipe, insertedIngredients, insertedInstructions };
				} catch (e: unknown) {
					console.log(e, e?.message);
					tx.rollback();
					return new Response((e as Error)?.message, { status: 400 });
				}
			});

			return new Response(result?.toString(), { status: 400 });
		} catch (error) {
			console.error('Error creating recipe:', error);
			throw error;
		}
	} else {
		return new Response('No data', { status: 400 });
	}
}
