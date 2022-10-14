export const getUID = (): string => {
	if (crypto && crypto.randomUUID) {
		return crypto.randomUUID();
	} else {
		return '' + new Date().getTime() + Math.floor(Math.random() * 10000);
	}
};
