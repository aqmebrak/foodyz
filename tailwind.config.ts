import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			listStyleType: {
				square: 'square'
			}
		}
	},
	darkMode: 'selector',

	plugins: []
} satisfies Config;
