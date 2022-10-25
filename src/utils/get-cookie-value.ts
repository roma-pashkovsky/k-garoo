export const getCookieValue = (name: string, cookies: string | null): string | null => {
	if (!cookies) {
		return null;
	}
	const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
	if (match) return match[2];
	else return null;
};
