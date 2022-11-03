import type { MainListItem, PersistedList } from '../../types';
import { get, writable } from 'svelte/store';
import { getListIds, removeListData, setListIds } from '../../utils/local-storage-state';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';

export const items = writable<MainListItem[]>([]);

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

/**
 * Reorder list
 */
export const reorderList = async (list: MainListItem[]): Promise<void> => {
	items.set(list);
	const listIds = list.map((l) => l.id);
	const user = get(auth).user;
	if (user) {
		await reorderListAPI(listIds);
	} else {
		await reorderListLocal(listIds);
	}
};

async function reorderListAPI(listIds: string[]): Promise<void> {
	await fetch(`/api/v1/reorder`, { method: 'POST', body: JSON.stringify(listIds) });
}

async function reorderListLocal(listIds: string[] = []): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			const listIdsObj = getListIds();
			const l = listIds?.length - 1;
			listIds.forEach((listId: string, ind) => {
				listIdsObj[listId].order = (l - ind) * 1000;
			});
			setListIds(listIdsObj);
			resolve();
		});
	});
}
