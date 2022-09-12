export const getUID = (): string => {
	if (crypto) {
		return crypto.randomUUID();
	} else {
		return '' + new Date().getTime() + Math.floor(Math.random() * 10000);
	}
};
