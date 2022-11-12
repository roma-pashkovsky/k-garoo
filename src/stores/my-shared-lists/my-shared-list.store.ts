import { derived, writable } from 'svelte/store';
import { appFetch } from '../../utils/app-fetch';

export const sharedListIds = writable<string[]>([]);

export const sharedListCount = derived(sharedListIds, ($listIds) => $listIds?.length);

export const loadSharedListIds = async (f = fetch): Promise<void> => {
	try {
		const listIds = await appFetch<string[]>('/my-shared-lists', { method: 'GET' }, f);
		sharedListIds.set(listIds);
	} catch (err) {
		console.log(err);
	}
};

export const acceptList = async (listId: string): Promise<void> => {
	await fetch(`/api/v1/my-shared-lists/${listId}/accept`, { method: 'POST' });
	sharedListIds.update((ids) => {
		return ids.filter((id) => id !== listId);
	});
};

export const rejectList = async (listId: string): Promise<void> => {
	await fetch(`/api/v1/my-shared-lists/${listId}/reject`, { method: 'POST' });
	sharedListIds.update((ids) => {
		return ids.filter((id) => id !== listId);
	});
};

export const blockUser = async (userId: string): Promise<void> => {
	await fetch(`/api/v1/blocked-users`, { method: 'POST', body: JSON.stringify({ userId }) });
	await loadSharedListIds();
};
