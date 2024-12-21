import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			listStyleType: {
				square: 'square'
			},
			colors: {
				lavender: '#9d49d6'
			}
		}
	},
	darkMode: 'selector',

	plugins: []
} satisfies Config;
