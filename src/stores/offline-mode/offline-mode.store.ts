import { writable } from 'svelte/store';
import { getSyncTasks } from '../../utils/local-storage-state';
import type { ApiSyncTask } from '../../types/api-sync-task';
import { appFetch } from '../../utils/app-fetch';

export const offline = writable<boolean>(false);

export const startOfflineListener = (): void => {
	addEventListener('online', () => {
		console.log(':online');
		offline.set(false);
		processSyncTasks();
	});

	addEventListener('offline', () => {
		console.log(':offline');
		offline.set(true);
	});
};

async function processSyncTasks(): Promise<void> {
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
			for (const task of groupTasks) {
				try {
					await appFetch(task.urlPath, { method: task.method, body: task.body }, fetch, 10000);
				} catch (err) {
					break;
				}
			}
		}
	}
}
