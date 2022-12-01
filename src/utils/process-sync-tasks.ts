import { addSyncTask, getSyncTasks } from './local-storage-state';
import { appFetch, NoConnectionError, TimeoutError, UnauthorizedError } from './app-fetch';
import type { ApiSyncTask } from '../types/api-sync-task';
import { writable } from 'svelte/store';

export const processedSyncTasks = writable<number | null>(null);

const processing = writable<boolean>(false);

function waitForProcessingFinished(): Promise<void> {
	return new Promise<void>((resolve) => {
		processing.subscribe((processing) => {
			if (!processing) resolve();
		});
	});
}

export async function processSyncTasks(): Promise<void> {
	await waitForProcessingFinished();
	processing.set(true);
	const syncTasks = await getSyncTasks();
	if (syncTasks?.length) {
		const groups: { [id: string]: ApiSyncTask[] } = {};
		syncTasks.forEach((st) => {
			if (!groups[st.groupId]) {
				groups[st.groupId] = [];
			}
			groups[st.groupId].push(st);
		});
		const groupIds = Object.keys(groups);
		for (const groupId of groupIds) {
			const groupTasks = groups[groupId];
			groupTasks.sort((a, b) => a.ts - b.ts);
			let hasProcessedTasks = false;
			for (let i = 0; i < groupTasks.length; i++) {
				const task = groupTasks[i];
				try {
					await appFetch(
						task.urlPath,
						{ method: task.method, ...(task.body ? { body: JSON.parse(task.body) } : {}) },
						fetch,
						10000,
						groupId
					);
					hasProcessedTasks = true;
				} catch (err) {
					if (
						err instanceof NoConnectionError ||
						err instanceof TimeoutError ||
						err instanceof UnauthorizedError
					) {
						// save rest of the tasks to retry later
						for (let j = i + 1; j < groupTasks.length; j++) {
							const nextTask = groupTasks[j];
							await addSyncTask(nextTask);
						}
					}
					break;
				}
			}
			if (hasProcessedTasks) {
				processedSyncTasks.set(new Date().getTime());
			}
		}
	}
	processing.set(false);
}
