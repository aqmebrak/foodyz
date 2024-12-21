<script lang="ts">
	import '../app.css';
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { ThemeSwitch } from '$lib/index';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();

	let { children, data }: { children: Snippet<[]>; data: LayoutData } = $props();

	const {
		elements: { menubar },
		builders: { createMenu }
	} = createMenubar();
	const {
		elements: { menu, item, trigger }
	} = createMenu();

	const {
		elements: { menu: menuA, item: itemA, trigger: triggerA }
	} = createMenu();
	const {
		elements: { menu: menuB, item: itemB, trigger: triggerB }
	} = createMenu();
</script>

<svlete:head>
	<title>Foodyz</title>
</svlete:head>

<header
	class="mx-auto flex w-full max-w-[1440px] items-center gap-4 border border-solid border-emerald-200 px-4 md:px-6 lg:px-8"
>
	<div class="order-2 flex items-center justify-center gap-2 p-2 md:order-1">
		<img
			src="/logo.png"
			alt="logo"
			class="h-full w-1/4 object-contain md:max-h-[52px] md:w-full md:max-w-[300px]"
		/>
		<h1 class="text-center text-xl font-semibold md:whitespace-nowrap md:text-4xl">
			<a href="/">Les recettes de la Barnière</a>
		</h1>
	</div>
	<!-- MENU -->
	<!-- <div class="order-1 text-base md:order-2" use:melt={$menubar}>
		<button use:melt={$trigger} class="">|||</button>
		<div
			use:melt={$menu}
			class="flex flex-col border border-solid border-emerald-500 bg-emerald-100 dark:bg-emerald-900"
		>
			<a
				{...$item}
				use:item
				class="cursor-pointer border-b border-emerald-500 p-2 hover:bg-white dark:hover:bg-emerald-800"
				href="/init">Reset</a
			>
			<a
				{...$item}
				use:item
				class="cursor-pointer p-2 hover:bg-white dark:hover:bg-emerald-800"
				href="/recipes/add">Add</a
			>
		</div>
	</div> -->
	<!--  TOGGLE DARK MODE  -->
	<div class="order-4 ml-auto">
		<ThemeSwitch />
	</div>
</header>

<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
	{@render children()}
</main>
