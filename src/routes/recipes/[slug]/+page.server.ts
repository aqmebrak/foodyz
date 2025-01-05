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

export const load = (async ({ params }) => {
	if (params.slug != null && !Number.isNaN(Number(params.slug))) {
		try {
			const [recipe, ingr, instruc] = await Promise.all([
				db
					.select({
						id: recipes.id,
						name: recipes.name,
						prepTime: recipes.prepTime,
						cookTime: recipes.cookTime,
						servings: recipes.servings,
						notes: recipes.notes
					})
					.from(recipes)
					.where(eq(recipes.id, Number(params.slug))),
				db
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
					.where(eq(recipes.id, Number(params.slug))),

				db
					.select({
						id: instructions.id,
						step: instructions.stepOrder,
						description: instructions.description
					})
					.from(instructions)
					.innerJoin(recipes, eq(instructions.recipeId, recipes.id))
					.where(eq(recipes.id, Number(params.slug)))
					.orderBy(instructions.stepOrder)
			]);

			console.log(recipe, ingr, instruc);

			return {
				recipe: recipe[0],
				ingredients: ingr,
				instructions: instruc
			};
		} catch (error) {
			console.error('Failed to load recipe data:', error);
			// In a load function, throwing an error will trigger SvelteKit's error boundary
			throw error;
		}
	}
}) satisfies PageServerLoad;
