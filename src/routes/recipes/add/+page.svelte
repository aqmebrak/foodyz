<script lang="ts">
	import type { PageData } from './$types';
	import IngredientsPicker from './IngredientsPicker.svelte';
	import type { FormValues } from './types';

	let { data }: { data: PageData } = $props();

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
		<div class="flex flex-col gap-2">
			<label class="text-sm" for="title">Titre:</label>
			<input type="text" name="title" bind:value={formValues.name} />
		</div>
		<div class="flex w-full flex-wrap items-center gap-2">
			<div class="flex flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="prepTime">Temps de préparation (min):</label>
				<input type="number" name="prepTime" bind:value={formValues.prepTime} />
			</div>
			<div class="flex flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="cookTime">Temps de cuisson (min):</label>
				<input type="number" name="cookTime" bind:value={formValues.cookTime} />
			</div>
			<div class="flex flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="servings">Portions:</label>
				<input type="number" name="servings" bind:value={formValues.servings} />
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<label for="notes" class="text-sm">Notes:</label>
			<textarea name="notes" bind:value={formValues.notes}></textarea>
		</div>
	</div>

	<hr class="h-[1px] w-full bg-white" />

	<IngredientsPicker bind:formValues units={data.units} ingredients={data.ingredients} />

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
