import {
	getCategoryOptionsLocalStorage,
	getListData,
	getListIds,
	getListSettingsLocalStorage
} from '../../utils/local-storage-state';
import type { CheckList, ChecklistSettings } from '../../types';
import type { SyncRequest } from '../../utils/api/client/sync';

export class SyncStore {
	public async syncLocalDataToDb(): Promise<any> {
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
		return fetch('/api/v1/sync', { method: 'POST', body: JSON.stringify(request) });
	}
}
