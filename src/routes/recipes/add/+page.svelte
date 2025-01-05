<script lang="ts">
	import IngredientsPicker from './IngredientsPicker.svelte';
	import type { FormValues } from './types';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	// Client API:
	const { form, errors, constraints, message, validate, enhance } = superForm(data.form, {
		dataType: 'json'
	});

	let recipeInstruction = $state('');

	const addInstruction = () => {
		$form.instructions = [...$form.instructions, recipeInstruction];
		recipeInstruction = '';
	};

	const removeInstruction = (index: number) => {
		$form.instructions = $form.instructions.filter((_, i) => i !== index);
	};
</script>

<h1 class="py-4 text-center text-3xl">Ajouter une recette</h1>
{#if $message}
	<p class="error">{$message}</p>
{/if}
<form id="recipe" class="flex flex-col gap-4" method="POST" use:enhance>
	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<label class="text-sm" for="title">Titre:</label>
			<input
				type="text"
				name="name"
				required
				bind:value={$form.name}
				{...$constraints.name}
				aria-invalid={$errors.name ? 'true' : undefined}
			/>
			{#if $errors.name}<span class="text-xs text-red-400">{$errors.name}</span>{/if}
		</div>
		<div class="flex w-full flex-wrap items-center gap-2">
			<div class="flex w-full flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="prepTime">Temps de préparation (min):</label>
				<input
					type="number"
					{...$constraints.prepTime}
					name="prepTime"
					bind:value={$form.prepTime}
					aria-invalid={$errors.prepTime ? 'true' : undefined}
				/>
				{#if $errors.prepTime}<span class="text-xs text-red-400">{$errors.prepTime}</span>{/if}
			</div>
			<div class="flex w-full flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="cookTime">Temps de cuisson (min):</label>
				<input
					type="number"
					{...$constraints.cookTime}
					name="cookTime"
					bind:value={$form.cookTime}
					aria-invalid={$errors.cookTime ? 'true' : undefined}
				/>
				{#if $errors.cookTime}<span class="text-xs text-red-400">{$errors.cookTime}</span>{/if}
			</div>
			<div class="flex w-full flex-1 flex-col gap-2 text-sm sm:w-1/4">
				<label for="servings">Portions:</label>
				<input
					type="number"
					name="servings"
					{...$constraints.servings}
					bind:value={$form.servings}
					aria-invalid={$errors.servings ? 'true' : undefined}
				/>
				{#if $errors.servings}<span class="text-xs text-red-400">{$errors.servings}</span>{/if}
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<label for="notes" class="text-sm">Notes:</label>
			<textarea
				name="notes"
				{...$constraints.notes}
				bind:value={$form.notes}
				aria-invalid={$errors.notes ? 'true' : undefined}
			></textarea>
			{#if $errors.notes}<span class="text-xs text-red-400">{$errors.notes}</span>{/if}
		</div>
	</div>

	<hr class="h-[1px] w-full bg-white" />

	<IngredientsPicker
		bind:ingredientsForm={$form.ingredients}
		units={data.units}
		ingredients={data.ingredients}
	/>
	{#if $errors.ingredients && $form.ingredients.length === 0}
		<span class="text-xs text-red-400">{$errors.ingredients._errors}</span>
	{/if}

	<hr class="h-[1px] w-full bg-white" />

	<div class="flex flex-col gap-2">
		<h2 class="text-2xl">Instructions</h2>

		<div class="flex w-full flex-col gap-2">
			<textarea bind:value={recipeInstruction}></textarea>
			<button type="button" onclick={addInstruction}>Add instruction</button>
		</div>

		<ol>
			{#each $form.instructions as instruction, index}
				<li>
					{instruction}
					<button type="button" onclick={() => removeInstruction(index)}>X</button>
				</li>
			{/each}
		</ol>
		{#if $errors.instructions && $form.instructions.length === 0}
			<span class="text-xs text-red-400">
				{$errors.instructions._errors}
			</span>
		{/if}
	</div>

	<input name="ingredients" value={$form.ingredients} type="hidden" />
	<input name="steps" value={$form.instructions} type="hidden" />
</form>
<div class="sticky bottom-0 left-0 -mx-4">
	<div class="bg-emerald-900/75 p-4 backdrop-blur-xl sm:bg-inherit sm:backdrop-blur-none">
		<button class="w-full" type="submit" form="recipe">Save</button>
	</div>
</div>
