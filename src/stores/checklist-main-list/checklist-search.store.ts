import { get, writable } from 'svelte/store';
import type { MainListItem, PersistedList } from '../../types';
import { getListIds } from '../../utils/local-storage-state';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';
import { offline } from '../offline-mode/offline-mode.store';
import { appFetch } from '../../utils/app-fetch';

export const searchValue = writable<string | null>(null);
export const searchedItems = writable<MainListItem[]>([]);

export const onChecklistMainListSearch = (query: string | undefined): void => {
	if (!query) {
		searchValue.set(null);
		searchedItems.set([]);
	} else {
		searchValue.set(query);
		searchListAPI();
	}
};

export const searchListAPI = async (): Promise<void> => {
	const currentSearch = get(searchValue);
	if (!currentSearch?.length) {
		searchedItems.set([]);
	} else {
		const itemIds = await getListItemsWithSearch(currentSearch);
		searchedItems.set(itemIds);
	}
};

export const getListItemsWithSearch = async (currentSearch: string): Promise<MainListItem[]> => {
	const localIds = await getListIds(currentSearch);
	const user = get(auth).user;
	if (user && !get(offline)) {
		return appFetch<PersistedList | null>(
			`/lists?search=${currentSearch}`,
			{ method: 'GET' },
			fetch,
			5000
		)
			.then((list) => {
				return getSortedListIdsFromPersistedList(list);
			})
			.catch((err) => {
				console.error(err);
				return getSortedListIdsFromPersistedList(localIds);
			});
	} else {
		return getSortedListIdsFromPersistedList(localIds);
	}
};
