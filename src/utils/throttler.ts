export const throttler = (timeMillis: number): ((cb: () => void) => void) => {
	let timeout: any;
	return (cb: () => void) => {
		if (timeout) {
			return;
		}
		cb();
		timeout = setTimeout(() => {
			clearTimeout(timeout);
			timeout = undefined;
		}, timeMillis);
	};
};
