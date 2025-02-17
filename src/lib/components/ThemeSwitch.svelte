<script lang="ts">
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let isDarkMode: boolean | null = null;

	// actions
	const toggleDarkMode = () => {
		if (browser) {
			isDarkMode = !isDarkMode;

			localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
			document.documentElement.classList.toggle(
				'dark',
				localStorage.theme === 'dark' ||
					(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
			);
		}
	};

	onMount(() => {
		isDarkMode = localStorage.getItem('theme') === 'dark';

		if (isDarkMode) {
			document.documentElement.classList.toggle(
				'dark',
				localStorage.theme === 'dark' ||
					(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
			);
		}
	});

	const {
		elements: { menubar },
		builders: { createMenu }
	} = createMenubar();
	const {
		elements: { menu, item, trigger }
	} = createMenu();
</script>

<button
	onclick={() => toggleDarkMode()}
	class={`toggle ${isDarkMode && 'night'}`}
	aria-label="theme toggle"
>
	<div class="notch">
		<div class="crater"></div>
		<div class="crater"></div>
	</div>
	<div>
		<div class="shape sm"></div>
		<div class="shape sm"></div>
		<div class="shape md"></div>
		<div class="shape lg"></div>
	</div>
</button>

<style lang="postcss">
	.toggle {
		height: 25px;
		width: 50px;
		border-radius: 50px;
		background-image: linear-gradient(aqua, skyblue);
		position: relative;
		cursor: pointer;
	}

	.toggle.night {
		background-image: linear-gradient(midnightblue, rebeccapurple);
	}

	.notch {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: yellow;
		position: absolute;
		top: 3px;
		left: 3px;
		box-shadow: 0 0 5px yellow;
		z-index: 1;
		transition: all 0.3s ease;
	}

	.notch > .crater {
		background: burlywood;
		border-radius: 50%;
		position: absolute;
		opacity: 0;
		box-shadow: 0 5px 5px rgba(0, 0, 0, 0.4) inset;
	}
	.night .crater {
		opacity: 0.4;
	}

	.crater:first-child {
		left: 1px;
		top: 3px;
		height: 4px;
		width: 10px;
		transform: rotate(-45deg);
	}

	.crater:last-child {
		right: 5px;
		top: 7px;
		height: 4px;
		width: 6px;
		transform: rotate(45deg);
	}

	.night > .notch {
		background: whitesmoke;
		box-shadow: 0 0 5px whitesmoke;
		transform: translate(24px, 0);
	}

	.shape {
		position: absolute;
		background: whitesmoke;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.shape.sm {
		height: 1px;
		width: 12px;
		top: 50%;
		left: 60%;
	}

	.shape.md {
		height: 3px;
		width: 18px;
		top: 12%;
		left: 12%;
		z-index: 2;
	}

	.shape.lg {
		height: 4px;
		width: 25px;
		bottom: 5px;
		left: 12%;
	}

	.night .shape {
		background: lightgray;
		box-shadow: 0 0 10px 2px violet;
	}

	.night .shape.sm {
		height: 2px;
		width: 2px;
		transform: translate(-10px, 0);
	}

	.night .shape.sm:first-of-type {
		transform: translate(-20px, -3px);
	}

	.night .shape.md {
		height: 5px;
		width: 5px;
		transform: translate(5px, 0);
	}

	.night .shape.lg {
		height: 7px;
		width: 7px;
		transform: translate(-3px, 0);
	}
</style>
