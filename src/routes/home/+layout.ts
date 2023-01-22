import { AppSettingsStore, loadAppSettings } from '../../stores/app/app-settings';
import { browser } from '$app/environment';
import { loadUserFromSession } from '../../stores/login/auth';
import { loadCategoryOptions } from '../../stores/checklist-details/category-options';
import type { LayoutLoad } from '../../../.svelte-kit/types/src/routes/home/$types';

export const load: LayoutLoad = async ({ fetch }): Promise<any> => {
	await loadUserFromSession(fetch, browser);
	await loadCategoryOptions(browser, fetch);
	await loadAppSettings(fetch);
	if (browser) {
		await AppSettingsStore.init(fetch);
	}
};
