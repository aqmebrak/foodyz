<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type IngredientDraft = {
		name: string;
		id: number | null;
		quantity: number;
		unitId: number | null;
	};
	type FormValues = {
		name: string;
		notes: string;
		ingredients: IngredientDraft[];
		instructions: string[];
		prepTime: number | null;
		cookTime: number | null;
		servings: number | null;
	};

	let recipeIngredient: IngredientDraft = $state({
		name: '',
		id: null,
		quantity: 0,
		unitId: null
	});

	let recipeInstruction = $state('');

	let formValues: FormValues = $state({
		name: '',
		notes: '',
		ingredients: [],
		instructions: [],
		prepTime: null,
		cookTime: null,
		servings: null
	});

	const addIngredient = () => {
		if (
			recipeIngredient.name !== '' &&
			recipeIngredient.quantity !== 0 &&
			recipeIngredient.unitId !== null
		) {
			formValues.ingredients = [...formValues.ingredients, recipeIngredient];
			recipeIngredient = {
				name: '',
				id: null,
				quantity: 0,
				unitId: null
			};
		} else {
			// error display here
		}
	};

	const removeIngredient = (index: number) => {
		formValues.ingredients = formValues.ingredients.filter((_, i) => i !== index);
	};

	const addInstruction = () => {
		formValues.instructions = [...formValues.instructions, recipeInstruction];
		recipeInstruction = '';
	};

	const removeInstruction = (index: number) => {
		formValues.instructions = formValues.instructions.filter((_, i) => i !== index);
	};

	const sendRecipe = async () => {
		try {
			await fetch('/recipes/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formValues)
			});
		} catch (e) {
			console.error(e);
		}
	};
</script>

<h1 class="py-4 text-center text-3xl">Ajouter une recette</h1>

<form onsubmit={sendRecipe} class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<label class="text-sm" for="title">Titre:</label>
		<input type="text" name="title" bind:value={formValues.name} />
		<div class="flex gap-4">
			<label class="flex flex-col text-sm" for="prepTime"
				>Preparation time (min):
				<input type="number" name="prepTime" bind:value={formValues.prepTime} />
			</label>
			<label class="flex flex-col text-sm" for="cookTime">
				Cooking time (min):
				<input type="number" name="cookTime" bind:value={formValues.cookTime} />
			</label>
			<label class="flex flex-col text-sm" for="servings">
				Servings:
				<input type="number" name="servings" bind:value={formValues.servings} />
			</label>
		</div>
		<textarea name="notes" bind:value={formValues.notes}></textarea>
	</div>

	<hr class="h-[1px] w-full bg-white" />

	<div class="flex flex-col gap-2">
		<h2 class="py-2 text-2xl">Ingredients</h2>

		<div class="flex flex-wrap items-center gap-2">
			<select placeholder="" class="w-full" bind:value={recipeIngredient}>
				<option value={null} selected>Selectionner un ingrédient</option>
				{#each data.ingredients as ingredient}
					<option value={ingredient}>{ingredient.name}</option>
				{/each}
			</select>
			<input type="number" bind:value={recipeIngredient.quantity} />
			<select class="w-full" bind:value={recipeIngredient.unitId}>
				{#each data.units as unit}
					<option value={unit.id}>{unit.name}</option>
				{/each}
			</select>
			<button type="button" onclick={addIngredient}>Add ingredient</button>
		</div>

		<ul class="">
			{#each formValues.ingredients as ingredient, index}
				<li>
					{ingredient.name} -- {ingredient.quantity} -- {ingredient.unitId}
					<button type="button" onclick={() => removeIngredient(index)}>Remove</button>
				</li>
			{/each}
		</ul>
	</div>

	<hr class="h-[1px] w-full bg-white" />

	<div class="flex flex-col gap-2">
		<h2 class="text-2xl">Instructions</h2>

		<div class="flex w-full flex-col gap-2">
			<textarea bind:value={recipeInstruction}></textarea>
			<button type="button" onclick={addInstruction}>Add instruction</button>
		</div>

		<ol>
			{#each formValues.instructions as instruction, index}
				<li>
					{instruction}
					<button type="button" onclick={() => removeInstruction(index)}>X</button>
				</li>
			{/each}
		</ol>
	</div>

	<input name="ingredients[]" value={JSON.stringify(formValues.ingredients)} type="hidden" />
	<input name="steps[]" value={JSON.stringify(formValues.instructions)} type="hidden" />

	<hr class="h-[1px] w-full bg-white" />

	<button type="submit">Save</button>
</form>
