<script lang="ts">
	import '../app.css';
	import { createMenubar, melt } from '@melt-ui/svelte';

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

<header>
	<div use:melt={$menubar}>
		<button use:melt={$trigger}>File</button>
		<div use:melt={$menu}>
			<div {...$item} use:item>...</div>
			<div {...$item} use:item>...</div>
			<div {...$item} use:item>...</div>
		</div>

		<button use:melt={$triggerA}>Edit</button>
		<div use:melt={$menuA}>
			<div {...$itemA} use:itemA>...</div>
			<div {...$itemA} use:itemA>...</div>
			<div {...$itemA} use:itemA>...</div>
		</div>

		<button use:melt={$triggerB}>Help</button>
		<div use:melt={$menuB}>
			<div {...$itemB} use:itemB>...</div>
			<div {...$itemB} use:itemB>...</div>
			<div {...$itemB} use:itemB>...</div>
		</div>
	</div>
</header>

{@render children()}
