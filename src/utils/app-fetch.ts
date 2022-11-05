const prefix = '/api/v1';

/**
 * Throws if request is not ok
 * @param urlPath - endpoint url path without prefix e.g. /users
 * @param reqInit - standard request init as in browser fetch
 * @param f default to browser fetch, pass svelte fetch when necessary
 */
export async function appFetch<T>(
	urlPath: string,
	reqInit: RequestInit = { method: 'GET' },
	f = fetch
): Promise<T> {
	const resp = await f(prefix + urlPath, reqInit);
	const body = await resp.json();
	if (!resp.ok) {
		throw new Error(body?.error as string);
	}
	return body;
}
