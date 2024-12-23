import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import {
	recipes,
	recipeIngredients,
	instructions,
	ingredients,
	units
} from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	if (params.slug != null && !Number.isNaN(Number(params.slug))) {
		const recipe = await db
			.select({
				id: recipes.id,
				name: recipes.name,
				prepTime: recipes.prepTime,
				cookTime: recipes.cookTime,
				servings: recipes.servings,
				notes: recipes.notes
			})
			.from(recipes)
			.where(eq(recipes.id, Number(params.slug)));

		const ingr = await db
			.select({
				quantity: recipeIngredients.quantity,
				unit: units.name,
				notes: recipeIngredients.notes,
				name: ingredients.name
			})
			.from(recipeIngredients)
			.innerJoin(recipes, eq(recipeIngredients.recipeId, recipes.id))
			.innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
			.innerJoin(units, eq(recipeIngredients.unitId, units.id))
			.where(eq(recipes.id, Number(params.slug)));

		const instruc = await db
			.select({
				id: instructions.id,
				step: instructions.stepOrder,
				description: instructions.description
			})
			.from(instructions)
			.innerJoin(recipes, eq(instructions.recipeId, recipes.id))
			.orderBy(instructions.stepOrder);

		return {
			recipe: recipe[0],
			ingredients: ingr,
			instructions: instruc
		};
	}

	error(404, 'Recipe not found');
}) satisfies PageServerLoad;
