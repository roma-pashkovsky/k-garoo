import { get, writable } from 'svelte/store';
import { ChecklistMainListDbPersistence } from './checklist-main-list-db-persistence';
import { ChecklistMainListLocalStoragePersistence } from './checklist-main-list-local-storage-persistence';
import { getListIds } from '../../utils/local-storage-state';
import type { PersistedList } from '../../types';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';

export const items = writable<string[]>([]);

export const loadListItems = async (browser: boolean, f = fetch): Promise<void> => {
	let list: PersistedList | null;
	const user = get(auth).user;
	if (user) {
		const listIdsResp = await f(`/api/v1/lists`);
		list = await listIdsResp.json();
	} else {
		if (browser) {
			list = getListIds();
		} else {
			list = null;
		}
	}
	if (list) {
		items.set(getSortedListIdsFromPersistedList(list));
	}
};

export class ChecklistMainListStore {
	public static items = items;

	private localPersistence = new ChecklistMainListLocalStoragePersistence();
	private dbPersistence = new ChecklistMainListDbPersistence();

	public destroy() {
		this.dbPersistence.destroy();
	}

	public async removeList(listId: string): Promise<void> {
		ChecklistMainListStore.items.update((items) => {
			return items.filter((id) => id !== listId);
		});
		await this.localPersistence.removeList(listId);
		if (this.dbPersistence.isLoggedIn) {
			await this.dbPersistence.removeList(listId);
		}
	}
}
