import { get, writable } from 'svelte/store';
import { getListIds, removeListData, setListIds } from '../../utils/local-storage-state';
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

export const removeList = async (listId: string): Promise<void> => {
	const user = get(auth).user;
	if (user) {
		await removeListAPI(listId);
	} else {
		await removeListLocal(listId);
	}
	await loadListItems(false);
};

async function removeListAPI(listId: string): Promise<void> {
	await fetch(`/api/v1/lists/${listId}`, { method: 'DELETE' });
}

async function removeListLocal(listId: string): Promise<void> {
	const ids = getListIds();
	delete ids[listId];
	setListIds(ids);
	removeListData(listId);
}
