import { db } from '$lib/server/db';
import { reset } from 'drizzle-seed';
import type { Actions } from './$types';
import * as schema from '$lib/server/db/schema';
import { ingredients, units } from '$lib/server/db/schema';

export const actions = {
	default: async () => {
		// reset ingredients
		await reset(db, schema);

		// push list from data.json into ingredients
		const data = await import('./data.json');
		await db.insert(ingredients).values(data.ingredients.map((name) => ({ name })));
		await db.insert(units).values(data.units.map((name) => ({ name })));
	}
} satisfies Actions;
