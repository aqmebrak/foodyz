import { pgTable, serial, text, integer, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull()
});

export const units = pgTable('units', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull()
});

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull()
});

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull()
});

export const ingredientToRecipes = pgTable('ingredients_recipes', {
	id: serial('id').primaryKey(),
	ingredientId: integer('ingredient_id')
		.notNull()
		.references(() => ingredients.id),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id),
	unitId: integer('unit_id')
		.notNull()
		.references(() => units.id)
});

export const instructions = pgTable('instructions', {
	id: serial('id').primaryKey(),
	step: integer('step').notNull(),
	description: text('description').notNull(),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id)
});
