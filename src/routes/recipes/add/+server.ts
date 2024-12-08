import { db } from '$lib/server/db';
import { recipes, instructions, ingredientToRecipes } from '$lib/server/db/schema';

export async function POST({ request }) {
	// get body and parse json
	const data = await request.json();

	// const data = await event.request.formData();

	if (data) {
		// insert recipe
		const recipeId = await db
			.insert(recipes)
			.values({
				name: data.name
			})
			.returning({ insertedId: recipes.id });

		// then update ingredientToRecipes table
		await db.insert(ingredientToRecipes).values(
			data.ingredients.map((ingredient) => ({
				ingredientId: ingredient.id,
				recipeId: recipeId[0].insertedId,
				unitId: ingredient.unitId
			}))
		);

		// steps/instructions
		await db.insert(instructions).values(
			data.instructions.map((instruction, index) => ({
				recipeId: recipeId[0].insertedId,
				step: index,
				description: instruction
			}))
		);

		return new Response('Success', { status: 200 });
	}

	return new Response('No data', { status: 400 });
}
