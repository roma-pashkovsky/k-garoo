import { loadListItems } from '../../../stores/checklist-main-list/checklist-main-list-store';
import { browser } from '$app/environment';
import type { Load } from '@sveltejs/kit';
import { loadUserIfNotResolved } from '../../../stores/login/auth';
import { loadSharedListIds } from '../../../stores/my-shared-lists/my-shared-list.store';

export const load: Load = async ({ fetch }) => {
	await loadUserIfNotResolved(fetch, browser);
	await loadListItems(browser, fetch);
	loadSharedListIds(fetch);
};
