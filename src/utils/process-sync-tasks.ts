import { getSyncTasks, removeSyncTask } from './local-storage-state';
import { appFetch } from './app-fetch';
import { writable } from 'svelte/store';

export const processedSyncTasks = writable<number | null>(null);
export const processSynTaskError = writable<any | null>(null);

export const syncTaskProcessing = writable<boolean>(false);

function waitForProcessingFinished(): Promise<void> {
	return new Promise<void>((resolve) => {
		syncTaskProcessing.subscribe((processing) => {
			if (!processing) resolve();
		});
	});
}

/**
 * const groups: { [id: string]: ApiSyncTask[] } = {};
 *        syncTasks.forEach((st) => {
 * 			if (!groups[st.groupId]) {
 * 				groups[st.groupId] = [];
 * 			}
 * 			groups[st.groupId].push(st);
 * 		});
 *        const groupIds = Object.keys(groups);
 *        for (const groupId of groupIds) {
 * 			const groupTasks = groups[groupId];
 * 			groupTasks.sort((a, b) => a.ts - b.ts);
 * 			let hasProcessedTasks = false;
 * 			for (let i = 0; i < groupTasks.length; i++) {
 * 				const task = groupTasks[i];
 * 				try {
 * 					await appFetch(
 * 						task.urlPath,
 * 						{ method: task.method, ...(task.body ? { body: JSON.parse(task.body) } : {}) },
 * 						fetch,
 * 						10000,
 * 						groupId
 * 					);
 * 					await removeSyncTask(task);
 * 					hasProcessedTasks = true;
 * 				} catch (err) {
 * 					// remove this task and the next tasks in the group, if the error is not recoverable
 * 					if (
 * 						!(
 * 							err instanceof NoConnectionError ||
 * 							err instanceof TimeoutError ||
 * 							err instanceof UnauthorizedError
 * 						)
 * 					) {
 * 						for (let j = i; j < groupTasks.length; j++) {
 * 							const nextTask = groupTasks[j];
 * 							await removeSyncTask(nextTask);
 * 						}
 * 					}
 * 					break;
 * 				}
 * 			}
 * 			if (hasProcessedTasks) {
 * 				processedSyncTasks.set(new Date().getTime());
 * 			}
 * 		}
 */
export async function processSyncTasks(): Promise<void> {
	await waitForProcessingFinished();
	syncTaskProcessing.set(true);
	let syncTasks = await getSyncTasks();
	syncTasks = syncTasks.filter((s) => validateSyncTask(s));
	if (syncTasks?.length) {
		try {
			const { processed } = await appFetch<{ processed: string[] }>(
				'/process-sync-tasks',
				{ method: 'POST', body: JSON.stringify(syncTasks) },
				fetch
			);
			if (processed?.length) {
				processedSyncTasks.set(new Date().getTime());
				processed.forEach((taskId) => {
					removeSyncTask(taskId);
				});
			}
		} catch (e) {
			console.error('Error processing sync tasks', e);
		}
	}
	syncTaskProcessing.set(false);
}

function validateSyncTask(t: any): boolean {
	return !!t && t.type && t.payload && t.ts && t.id;
}
