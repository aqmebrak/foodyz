import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';

export const load = (async () => {
	const list = await db.select().from(recipes);
	return {
		recipes: list
	};
}) satisfies PageServerLoad;
