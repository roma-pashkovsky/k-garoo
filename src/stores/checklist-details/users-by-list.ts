import { get, writable } from 'svelte/store';
import type { AppUser } from '../../types/auth';
import { listDataStore } from './checklist-details-data';
import { auth } from '../login/auth';
import { appFetch } from '../../utils/app-fetch';

export const usersByListStore = writable<{ [listId: string]: AppUser[] }>({});

export const usersByListDrawerStore = writable<{ listId: string } | null>(null);

export const loadUsersByList = async (listId: string): Promise<void> => {
	if (!get(auth).user) {
		return;
	}
	return new Promise((resolve) => {
		const listData = get(listDataStore);
		const list = listData[listId];
		if (list?.isMyList || list?.sharedBy) {
			doLoadUsersByList(listId)
				.then((users) => {
					usersByListStore.update((prev) => ({ ...prev, [listId]: users }));
					resolve();
				})
				.catch((err) => {
					console.error(err);
					resolve();
				});
		}
	});
};

async function doLoadUsersByList(listId: string): Promise<AppUser[]> {
	return appFetch<AppUser[]>(`/lists/${listId}/users`, { method: 'GET' });
}
