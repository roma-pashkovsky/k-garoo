export const debouncer = (timeMillis: number): ((cb: () => void) => void) => {
	let timeout: any;
	return (cb: () => void) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => cb(), timeMillis);
	};
};
