import type { MainListItem, PersistedList } from '../../types';
import { derived, get, writable } from 'svelte/store';
import { getListIds, removeListData, setListIds } from '../../utils/local-storage-state';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';
import { appFetch } from '../../utils/app-fetch';
import { offline } from '../offline-mode/offline-mode.store';
import { searchedItems, searchValue } from './checklist-search.store';
import { SyncTaskTypes } from '../../utils/api/client/sync-task-types';
import type {
	DeleteListSyncTask,
	ReorderListSyncTask
} from '../../utils/api/client/sync-task-types';
import { getUID } from '../../utils/get-uid';

export const items = writable<MainListItem[]>([]);

export const listItems = derived([searchValue, items, searchedItems], ([sValue, list, sItems]) => {
	if (!sValue) {
		return list;
	}
	return sItems;
});

export const lastVisitedListId = writable<string | null>(null);

export const loadListItems = async (browser: boolean, f = fetch): Promise<void> => {
	const res = await getListItems(browser, f);
	items.set(res);
};

export const getListItems = async (browser: boolean, f = fetch): Promise<MainListItem[]> => {
	let resultIds = {};
	if (browser) {
		resultIds = await getListIds();
	}
	const user = get(auth).user;
	if (user && !get(offline)) {
		return appFetch<PersistedList | null>(`/lists`, { method: 'GET' }, f, 5000)
			.then((list) => {
				if (browser) {
					setListIds(list);
				}
				return getSortedListIdsFromPersistedList(list);
			})
			.catch((err) => {
				console.error(err);
				return getSortedListIdsFromPersistedList(resultIds);
			});
	} else {
		return getSortedListIdsFromPersistedList(resultIds);
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
	const syncTask: DeleteListSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.DELETE_LIST,
		payload: listId,
		ts: new Date().getTime(),
		groupId: listId
	};
	await appFetch(`/lists/${listId}`, { method: 'DELETE' }, fetch, 10000, syncTask);
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
	const syncTask: ReorderListSyncTask = {
		id: getUID(),
		type: SyncTaskTypes.REORDER_LIST,
		payload: listIds,
		ts: new Date().getTime()
	};
	await appFetch(
		`/reorder`,
		{ method: 'POST', body: JSON.stringify(listIds) },
		fetch,
		10000,
		syncTask
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
