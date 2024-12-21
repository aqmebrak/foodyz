<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mt-4 flex flex-col gap-4 p-4">
	<h2 class="text-2xl underline">Liste des recettes:</h2>
	<ul class="flex flex-col gap-2 pl-8">
		{#each data.recipes as recipe}
			<li class="list-square">
				<a class="underline hover:no-underline" href={`/recipes/${recipe.id}`}>{recipe.name}</a>
			</li>
		{/each}
	</ul>
</div>
