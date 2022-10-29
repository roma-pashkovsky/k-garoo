import { loadListItems } from '../../../stores/checklist-main-list/checklist-main-list-store';
import { browser } from '$app/environment';
import type { Load } from '@sveltejs/kit';
import { loadUserIfNotResolved } from '../../../stores/login/auth';

export const load: Load = async ({ fetch }) => {
	await loadUserIfNotResolved(fetch);
	await loadListItems(browser, fetch);
};
