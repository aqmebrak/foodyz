export const ariaKeyDownA11yHandler = (handler: () => void) => ({
	onkeydown: (event: KeyboardEvent) => {
		event.preventDefault();
		if (event.key === 'Enter') {
			handler();
		}
	}
});
