<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createCombobox, melt, type ComboboxOptionProps } from '@melt-ui/svelte';
	import { ChevronDown, ChevronUp, Check } from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { FormValues } from './types';

	type Units = {
		id: string;
		name: string;
	};

	let {
		ingredientsForm = $bindable(),
		units,
		ingredients
	}: {
		ingredientsForm: FormValues['ingredients'];
		units: PageData['units'];
		ingredients: PageData['ingredients'];
	} = $props();

	let ingredientQuantity = $state(null);

	// Ingredients
	const {
		elements: { menu, input, option, label },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected }
	} = createCombobox<FormValues['ingredients']>({
		forceVisible: true
	});

	let filtreredIngredients = $derived.by(() => {
		if ($touchedInput) {
			return ingredients.filter((ingredient) =>
				ingredient.name.toLowerCase().includes($inputValue.toLowerCase())
			);
		}
		return ingredients;
	});

	$effect(() => {
		if (!$open) {
			$inputValue = $selected?.label ?? '';
		}
	});

	// Units
	const {
		elements: { menu: menuUnits, input: inputUnits, option: optionUnits, label: labelUnits },
		states: {
			open: openUnits,
			inputValue: inputValueUnits,
			touchedInput: touchedInputUnits,
			selected: selectedUnits
		},
		helpers: { isSelected: isSelectedUnits }
	} = createCombobox<Units>({
		forceVisible: true
	});

	let filteredUnits = $derived.by(() => {
		if ($touchedInputUnits) {
			return units.filter((unit) =>
				unit.name.toLowerCase().includes($inputValueUnits.toLowerCase())
			);
		}

		return units;
	});

	$effect(() => {
		if (!$openUnits) {
			$inputValueUnits = $selectedUnits?.label ?? '';
		}
	});

	const addIngredient = () => {
		if (
			$selected != null &&
			$selected.label &&
			$selected.value &&
			ingredientQuantity != null &&
			$selectedUnits != null
		) {
			ingredientsForm = [
				...ingredientsForm,
				{
					name: $selected.label,
					id: Number($selected.value),
					quantity: ingredientQuantity,
					unitId: Number($selectedUnits.value)
				}
			];
			ingredientQuantity = null;
		} else {
			// error display here
		}

		// reset inputs
		$inputValue = '';
		$inputValueUnits = '';
		ingredientQuantity = null;
	};

	const removeIngredient = (index: number) => {
		ingredientsForm = ingredientsForm.filter((_, i) => i !== index);
	};
</script>

<div class="flex w-full flex-col gap-2">
	<h2 class="py-2 text-2xl">Ingredients</h2>

	<div class="flex w-full flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
		<!-- Ingredients -->
		<div class="flex w-full flex-col gap-1">
			<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
			<label use:melt={$label}>
				<span class="text-sm">Ingrédient</span>
			</label>

			<div class="relative">
				<input
					use:melt={$input}
					class="flex w-full items-center justify-between px-3"
					placeholder="Choisir un ingrédient"
				/>
				<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
					{#if $open}
						<ChevronUp class="size-4" />
					{:else}
						<ChevronDown class="size-4" />
					{/if}
				</div>
			</div>
		</div>
		{#if $open}
			<ul
				class=" z-10 flex max-h-[300px] flex-col overflow-hidden"
				use:melt={$menu}
				transition:fly={{ duration: 150, y: -5 }}
			>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black"
					tabindex="0"
				>
					{#each filtreredIngredients as ingredient, index (index)}
						<li
							use:melt={$option({ value: ingredient.id, label: ingredient.name })}
							class="hover:bg-magnum-100 data-[highlighted]:bg-magnum-200 data-[highlighted]:text-magnum-900 relative cursor-pointer scroll-my-2 py-2 pl-4 pr-4 data-[disabled]:opacity-50"
						>
							{#if $isSelected(ingredient)}
								<div class="check text-magnum-900 absolute left-2 top-1/2 z-10">
									<Check class="size-4" />
								</div>
							{/if}
							<div class="pl-4">
								<span class="font-medium">{ingredient.name}</span>
							</div>
						</li>
					{:else}
						<li class="relative cursor-pointer py-1 pl-8 pr-4">No results found</li>
					{/each}
				</div>
			</ul>
		{/if}

		<div class="flex w-full flex-col gap-1 sm:w-1/4">
			<label>
				<span class="text-sm">Quantité</span>
			</label>
			<input type="number" bind:value={ingredientQuantity} />
		</div>
		<!-- Units  -->
		<div class="flex w-full flex-col gap-1">
			<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
			<label use:melt={$labelUnits}>
				<span class="text-sm">Unité</span>
			</label>

			<div class="relative">
				<input
					use:melt={$inputUnits}
					class="flex w-full items-center justify-between px-3"
					placeholder="Choisir une unité"
				/>
				<div class="absolute right-2 top-1/2 z-10 -translate-y-1/2">
					{#if $openUnits}
						<ChevronUp class="size-4" />
					{:else}
						<ChevronDown class="size-4" />
					{/if}
				</div>
			</div>
		</div>
		{#if $openUnits}
			<ul
				class="z-10 flex max-h-[300px] flex-col overflow-hidden"
				use:melt={$menuUnits}
				transition:fly={{ duration: 150, y: -5 }}
			>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-black"
					tabindex="0"
				>
					{#each filteredUnits as unit, index (index)}
						<li
							use:melt={$optionUnits({ value: unit.id, label: unit.name })}
							class="hover:bg-magnum-100 data-[highlighted]:bg-magnum-200 data-[highlighted]:text-magnum-900 relative cursor-pointer scroll-my-2 py-2 pl-4 pr-4 data-[disabled]:opacity-50"
						>
							{#if $isSelectedUnits(unit)}
								<div class="check text-magnum-900 absolute left-2 top-1/2 z-10">
									<Check class="size-4" />
								</div>
							{/if}
							<div class="pl-4">
								<span class="font-medium">{unit.name}</span>
							</div>
						</li>
					{:else}
						<li class="relative cursor-pointer py-1 pl-8 pr-4">No results found</li>
					{/each}
				</div>
			</ul>
		{/if}
	</div>

	<button type="button" onclick={addIngredient}>Add ingredient</button>

	<ul class="">
		{#each ingredientsForm as ingredient, index}
			<li class="ml-8 list-disc">
				{ingredient.name}: {ingredient.quantity}{units.find((unit) => unit.id === ingredient.unitId)
					?.name !== '(empty)'
					? units.find((unit) => unit.id === ingredient.unitId)?.name
					: ''}
				<button
					type="button"
					class="bg-transparent text-sm text-red-500 underline hover:bg-transparent hover:no-underline"
					onclick={() => removeIngredient(index)}>remove</button
				>
			</li>
		{/each}
	</ul>
</div>
