import { relations } from 'drizzle-orm';
import {
	pgTable,
	serial,
	text,
	integer,
	varchar,
	numeric,
	primaryKey,
	timestamp
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const units = pgTable('units', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	name: varchar('name').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	prepTime: integer('prep_time'),
	cookTime: integer('cook_time'),
	servings: integer('servings'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Recipe Ingredients Join Table
export const recipeIngredients = pgTable(
	'recipe_ingredients',
	{
		recipeId: integer('recipe_id').references(() => recipes.id, { onDelete: 'cascade' }),
		ingredientId: integer('ingredient_id').references(() => ingredients.id, {
			onDelete: 'cascade'
		}),
		quantity: numeric('quantity'),
		unitId: integer('unit_id').references(() => units.id),
		notes: text('notes')
	},
	(table) => {
		return [
			{
				pk: primaryKey({ columns: [table.recipeId, table.ingredientId] })
			}
		];
	}
);

// Instructions
export const instructions = pgTable('instructions', {
	id: serial('id').primaryKey(),
	stepOrder: integer('step_order').notNull(),
	description: text('description').notNull(),
	recipeId: integer('recipe_id').references(() => recipes.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relation Definitions
export const recipeRelations = relations(recipes, ({ many }) => ({
	instructions: many(instructions),
	recipeIngredients: many(recipeIngredients)
}));

export const ingredientRelations = relations(ingredients, ({ many }) => ({
	recipeIngredients: many(recipeIngredients)
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipeIngredients.recipeId],
		references: [recipes.id]
	}),
	ingredient: one(ingredients, {
		fields: [recipeIngredients.ingredientId],
		references: [ingredients.id]
	}),
	unit: one(units, {
		fields: [recipeIngredients.unitId],
		references: [units.id]
	})
}));

export const instructionRelations = relations(instructions, ({ one }) => ({
	recipe: one(recipes, {
		fields: [instructions.recipeId],
		references: [recipes.id]
	})
}));

export const unitRelations = relations(units, ({ many }) => ({
	recipeIngredients: many(recipeIngredients)
}));
