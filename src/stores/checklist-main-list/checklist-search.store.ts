import { get, writable } from 'svelte/store';
import type { MainListItem } from '../../types';
import { getListIds, setListIds } from '../../utils/local-storage-state';
import { getSortedListIdsFromPersistedList } from '../../utils/get-sorted-list-ids-from-persisted-list';
import { auth } from '../login/auth';
import { offline } from '../offline-mode/offline-mode.store';
import { appFetch } from '../../utils/app-fetch';
import type { PersistedList } from '../../types';

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

const searchListAPI = async (): Promise<void> => {
	const currentSearch = get(searchValue);
	if (!currentSearch?.length) {
		searchedItems.set([]);
	} else {
		const localIds = await getListIds(currentSearch);
		searchedItems.set(getSortedListIdsFromPersistedList(localIds));

		const user = get(auth).user;
		if (user && !get(offline)) {
			appFetch<PersistedList | null>(
				`/lists?search=${currentSearch}`,
				{ method: 'GET' },
				fetch,
				5000
			)
				.then((list) => {
					searchedItems.set(getSortedListIdsFromPersistedList(list));
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}
};
