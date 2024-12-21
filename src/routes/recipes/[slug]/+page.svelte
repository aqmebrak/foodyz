<script lang="ts">
	import { RecipeInstructions } from '$lib/index';

	import type { PageData } from './$types';
	import { Clock, Users, Flame, ChefHat } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
</script>

<!-- display recipe info -->
<div class="mt-8 flex flex-col gap-6 p-4">
	<h2 class="flex w-fit items-center gap-2 text-center text-2xl"><ChefHat />{data.recipe.name}</h2>
	<div class="flex flex-col gap-2 sm:gap-4 md:flex-row">
		<div class="flex items-center gap-2"><Flame /> Cook time: {data.recipe.cookTime} min</div>
		<div class="flex items-center gap-2">
			<Clock /> Preparation time: {data.recipe.prepTime} min
		</div>
		<div class="flex items-center gap-2"><Users /> Servings: {data.recipe.servings}</div>
	</div>

	{#if data.recipe.notes}
		<div class="border border-solid border-emerald-200 p-2">
			<h3 class="pb-1 font-semibold tracking-widest">Notes</h3>
			<p class="whitespace-pre-line text-sm">{@html data.recipe.notes}</p>
		</div>
	{/if}

	<!-- display recipe ingredient list -->
	<div class="flex flex-col gap-2">
		<h3 class="text-xl font-semibold tracking-widest">Ingredients</h3>
		<ul class="ml-4 list-square">
			{#each data.ingredients as ingredient}
				<li>
					{ingredient.quantity}
					{ingredient.unit === '(empty)' ? '' : ingredient.unit}
					{ingredient.name}
				</li>
			{/each}
		</ul>
	</div>

	<RecipeInstructions instructions={data.instructions} />
</div>
