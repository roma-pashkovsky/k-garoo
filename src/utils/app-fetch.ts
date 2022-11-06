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
	f = fetch,
	timeoutMillis?: number
): Promise<T> {
	if (timeoutMillis && AbortController) {
		return new Promise<T>((resolve, reject) => {
			const abortController = new AbortController();
			const initWithController: RequestInit = {
				...reqInit,
				signal: abortController.signal
			};
			const timeoutHandle = setTimeout(() => {
				abortController.abort();
				reject(new TimeoutError(`${urlPath} timeout`));
			}, timeoutMillis);
			f(prefix + urlPath, initWithController)
				.then((resp) => {
					resp
						.json()
						.then((body) => {
							if (timeoutHandle) {
								clearTimeout(timeoutHandle);
							}
							if (resp.ok) {
								resolve(body);
							} else {
								reject(body.error);
							}
						})
						.catch((err) => reject(err));
				})
				.catch((apiError) => reject(apiError));
		});
	} else {
		const resp = await f(prefix + urlPath, reqInit);
		const body = await resp.json();
		if (!resp.ok) {
			throw new Error(body?.error as string);
		}
		return body;
	}
}

export class TimeoutError extends Error {
	type = 'timeout';
}
