import { get, writable } from 'svelte/store';
import { offline } from '../stores/offline-mode/offline-mode.store';
import { addSyncTask, removeSyncTask } from './local-storage-state';
import type { ApiSyncTask } from '../types/api-sync-task';

const prefix = '/api/v1';

export const invalidAuthEventStore = writable<number | null>(null);

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
	timeoutMillis?: number,
	syncGroupId?: string
): Promise<T> {
	if (get(offline) && syncGroupId) {
		await addSyncTask(getSyncTask(urlPath, reqInit.method, reqInit.body, syncGroupId));
		throw new NoConnectionError();
	}
	if (timeoutMillis && AbortController) {
		return new Promise<T>((resolve, reject) => {
			const abortController = new AbortController();
			const initWithController: RequestInit = {
				...reqInit,
				signal: abortController.signal
			};
			let syncTask: ApiSyncTask;
			if (syncGroupId) {
				syncTask = getSyncTask(urlPath, reqInit.method, reqInit.body, syncGroupId);
				addSyncTask(syncTask);
			}
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
								if (syncTask) {
									removeSyncTask(syncTask);
								}
								resolve(body);
							} else if (resp.status === 401) {
								invalidAuthEventStore.set(new Date().getTime());
								reject(new UnauthorizedError());
							} else {
								if (syncTask) {
									removeSyncTask(syncTask);
								}
								reject(body.error);
							}
						})
						// could not parse json
						.catch((err) => {
							console.log(resp);
							console.log('JSON parse err: ', err);
							return null;
						});
				})
				.catch((apiError) => reject(apiError));
		});
	} else {
		const resp = await f(prefix + urlPath, reqInit);
		const body = await resp.json().catch((err) => {
			console.log('JSON parse err (2): ', err);
			console.log(resp);
			return null;
		});
		if (!resp.ok) {
			throw new Error(body?.error as string);
		}
		return body;
	}
}

function getSyncTask(
	url: string,
	method: string | undefined,
	body: any | undefined,
	groupId: string
): ApiSyncTask {
	const res: ApiSyncTask = {
		groupId,
		urlPath: url,
		method: (method || 'GET') as any,
		ts: new Date().getTime()
	};
	if (body) {
		res.body = JSON.stringify(body);
	}
	return res;
}

export class TimeoutError extends Error {
	type = 'timeout';
}

export class NoConnectionError extends Error {
	type = 'no_connection';
}

export class UnauthorizedError extends Error {
	type = 'unauthorized';
}
