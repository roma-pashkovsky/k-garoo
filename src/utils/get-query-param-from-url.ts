export const getQueryParamFromUrl = (param: string, url: string): string | null => {
	if (!url) {
		return null;
	}
	const query = url.split('?')[1];
	if (!query) {
		return null;
	}
	const items = query.split('&');
	const item = items.find((it) => it.startsWith(param));
	if (item) {
		return item.split('=')[1];
	} else {
		return null;
	}
};
