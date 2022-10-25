import { browser } from '$app/environment';
import { auth, loadUserFromSession } from '../stores/login/auth';
import { AppSettingsStore, loadAppSettings } from '../stores/app/app-settings';
import type { LayoutLoad } from '../../.svelte-kit/types/src/routes/$types';
import { get } from 'svelte/store';
import { loadSharedListIds } from '../stores/my-shared-lists/my-shared-list.store';
import { loadCategoryOptions } from '../stores/checklist-details/category-options';

export const load: LayoutLoad = async ({ fetch }): Promise<any> => {
	await loadUserFromSession(fetch);
	await loadAppSettings(fetch);
	await loadCategoryOptions(browser, fetch);
	if (get(auth).user) {
		loadSharedListIds(fetch);
	}
	if (browser) {
		await AppSettingsStore.init();
	}
};
