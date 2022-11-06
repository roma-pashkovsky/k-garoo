import { browser } from '$app/environment';
import { loadUserFromSession } from '../stores/login/auth';
import { AppSettingsStore, loadAppSettings } from '../stores/app/app-settings';
import type { LayoutLoad } from '../../.svelte-kit/types/src/routes/$types';
import { loadCategoryOptions } from '../stores/checklist-details/category-options';

export const load: LayoutLoad = async ({ fetch }): Promise<any> => {
	await loadUserFromSession(fetch);
	await loadAppSettings(fetch);
	await loadCategoryOptions(browser, fetch);

	if (browser) {
		await AppSettingsStore.init(fetch);
	}
};
