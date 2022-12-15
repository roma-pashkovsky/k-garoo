import { loadListItems } from '../../../stores/checklist-main-list/checklist-main-list-store';
import { browser } from '$app/environment';
import type { Load } from '@sveltejs/kit';
import { auth } from '../../../stores/login/auth';
import { loadSharedListIds } from '../../../stores/my-shared-lists/my-shared-list.store';
import { get } from 'svelte/store';

export const load: Load = async ({ parent, fetch }) => {
	await parent();
	await loadListItems(browser, fetch);
	if (get(auth).user) {
		loadSharedListIds(fetch);
	}
};
