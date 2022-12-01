import {
	getCategoryOptionsLocalStorage,
	getListData,
	getListIds,
	getListSettingsLocalStorage
} from '../../utils/local-storage-state';
import type { CheckList, ChecklistSettings } from '../../types';
import type { SyncRequest } from '../../utils/api/client/sync';
import { appFetch } from '../../utils/app-fetch';
import { writable } from 'svelte/store';

export const syncLocalDataEvent = writable<number | null>(null);

export async function syncLocalDataToDb(): Promise<any> {
	const listsObj = getListIds();
	const listIds = Object.keys(listsObj);
	listIds.sort((a, b) => listsObj[b].updated_ts - listsObj[a].updated_ts);
	const listIdsToSync = listIds.slice(0, 10);
	const lists: CheckList[] = listIdsToSync.map((listId) => getListData(listId)) as CheckList[];
	const settings: { [id: string]: ChecklistSettings | null } = {};
	lists.forEach((l) => {
		settings[l?.id as string] = getListSettingsLocalStorage(l.id);
	});
	const categoryOptions = getCategoryOptionsLocalStorage();
	const request: SyncRequest = {
		lists,
		checklistSettings: settings,
		categoryOptions
	};
	try {
		await appFetch('/sync', { method: 'POST', body: JSON.stringify(request) });
		syncLocalDataEvent.set(new Date().getTime());
	} catch (e) {
		console.error(e);
	}
}
