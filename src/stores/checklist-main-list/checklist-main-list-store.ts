import type { MainListItem, PersistedList } from '../../types';
import { derived, get, writable } from 'svelte/store';
import { getListIds, removeListData, setListIds } from '../../utils/local-storage-state';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';
import { appFetch } from '../../utils/app-fetch';
import { offline } from '../offline-mode/offline-mode.store';
import { searchedItems, searchValue } from './checklist-search.store';

const items = writable<MainListItem[]>([]);

export const listItems = derived([searchValue, items, searchedItems], ([sValue, list, sItems]) => {
	if (!sValue) {
		return list;
	}
	return sItems;
});

export const lastVisitedListId = writable<string | null>(null);

export const loadListItems = async (browser: boolean, f = fetch): Promise<void> => {
	if (browser) {
		const localIds = await getListIds();
		items.set(getSortedListIdsFromPersistedList(localIds));
	}
	const user = get(auth).user;
	if (user && !get(offline)) {
		appFetch<PersistedList | null>(`/lists`, { method: 'GET' }, f, 5000)
			.then((list) => {
				if (browser) {
					setListIds(list);
				}
				items.set(getSortedListIdsFromPersistedList(list));
			})
			.catch((err) => {
				console.error(err);
			});
	}
};

export const removeList = async (listId: string): Promise<void> => {
	items.update((old) => old.filter((it) => it.id !== listId));
	const user = get(auth).user;
	await removeListLocal(listId);
	if (user) {
		await removeListAPI(listId);
	}
};

async function removeListAPI(listId: string): Promise<void> {
	await appFetch(`/lists/${listId}`, { method: 'DELETE' }, fetch, 10000, listId);
}

async function removeListLocal(listId: string): Promise<void> {
	const ids = await getListIds();
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
	await reorderListLocal(listIds);
	const user = get(auth).user;
	if (user) {
		await reorderListAPI(listIds);
	}
};

async function reorderListAPI(listIds: string[]): Promise<void> {
	await appFetch(
		`/reorder`,
		{ method: 'POST', body: JSON.stringify(listIds) },
		fetch,
		10000,
		'reorder' + new Date().getTime()
	);
}

async function reorderListLocal(listIds: string[] = []): Promise<void> {
	const listIdsObj = await getListIds();
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			const l = listIds?.length - 1;
			listIds.forEach((listId: string, ind) => {
				listIdsObj[listId].order = (l - ind) * 1000;
			});
			setListIds(listIdsObj);
			resolve();
		});
	});
}
