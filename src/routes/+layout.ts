import { browser } from '$app/environment';
import { loadUserFromSession } from '../stores/login/auth';
import type { LayoutLoad } from '../../.svelte-kit/types/src/routes/$types';
import { loadCategoryOptions } from '../stores/checklist-details/category-options';
import { loadAppSettings } from '../stores/app/app-settings';

export const load: LayoutLoad = async ({ fetch }): Promise<any> => {
	await loadUserFromSession(fetch, browser);
	await loadCategoryOptions(browser, fetch);
	await loadAppSettings(fetch);
};
