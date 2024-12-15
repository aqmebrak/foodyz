import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const list = await db.select({ name: recipes.name }).from(recipes);
	return {
		recipes: list
	};
};
