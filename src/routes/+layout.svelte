<script lang="ts">
	import '../app.css';
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { ThemeSwitch } from '$lib/index';

	let { children } = $props();

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
	class="mx-auto flex w-full max-w-[1440px] items-center gap-4 border border-solid border-green-200 px-4 md:px-6 lg:px-8"
>
	<div class="order-2 flex gap-2 p-2 md:order-1">
		<img
			src="/logo.png"
			alt="logo"
			class="h-full w-1/4 object-contain md:max-h-[52px] md:w-full md:max-w-[300px]"
		/>
		<h1 class="text-xl font-semibold md:whitespace-nowrap md:text-4xl">
			Les recettes de la Barnière
		</h1>
	</div>
	<!-- MENU -->
	<div class="order-1 md:order-2" use:melt={$menubar}>
		<button
			use:melt={$trigger}
			class="border-green-500 bg-green-100 text-xl md:text-2xl dark:bg-green-900 dark:hover:bg-green-800"
			>Menu</button
		>
		<div
			use:melt={$menu}
			class="flex flex-col border border-solid border-green-500 bg-green-100 text-xl md:text-2xl dark:bg-green-900"
		>
			<a
				{...$item}
				use:item
				class="cursor-pointer border-b border-green-500 p-4 hover:bg-white dark:hover:bg-green-800"
				href="/init">Reset</a
			>
			<a
				{...$item}
				use:item
				class="cursor-pointer p-4 hover:bg-white dark:hover:bg-green-800"
				href="/recipes/add">Add</a
			>
		</div>
	</div>
	<div class="order-3 ml-auto">
		<ThemeSwitch />
	</div>
</header>

<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
	{@render children()}
</main>
