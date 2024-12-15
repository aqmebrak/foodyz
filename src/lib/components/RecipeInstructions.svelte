<script lang="ts">
	import { ariaKeyDownA11yHandler } from '$lib/utils/a11y';
	import { cn } from '$lib/utils/cn';
	import { CheckCheck } from 'lucide-svelte';

	const { instructions } = $props();

	const checkedInstructions: string[] = $state([]);

	const toggleInstruction = (index: string) => {
		if (checkedInstructions.includes(index)) {
			checkedInstructions.splice(checkedInstructions.indexOf(index), 1);
		} else {
			checkedInstructions.push(index);
		}
	};

	const isInstructionChecked = (index: string) => checkedInstructions.find((i) => i === index);
</script>

<div class="flex flex-col gap-2">
	<h3 class="text-xl font-semibold tracking-widest">Instructions</h3>
	<ol>
		{#each instructions as instruction}
			<li
				class={cn(
					'pointer-cursor relative ml-8 w-fit list-decimal p-1 py-1 pl-2 transition-colors duration-500 hover:bg-emerald-100 hover:text-gray-700',
					isInstructionChecked(instruction.id) &&
						'list-none bg-emerald-100 text-gray-700 line-through'
				)}
			>
				{#if isInstructionChecked(instruction.id)}
					<CheckCheck class="absolute -left-8 text-emerald-200" />
				{/if}
				<div
					role="button"
					tabindex="0"
					{...ariaKeyDownA11yHandler(() => toggleInstruction(instruction.id))}
					onclick={() => toggleInstruction(instruction.id)}
				>
					{instruction.description}
				</div>
			</li>
		{/each}
	</ol>
</div>
