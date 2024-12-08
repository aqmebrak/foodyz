import { db } from '$lib/server/db';
import { ingredients, units } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const list = await db.select().from(ingredients);
	const unitsList = await db.select().from(units);
	return {
		ingredients: list,
		units: unitsList
	};
};
