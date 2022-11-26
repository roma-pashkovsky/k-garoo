import type { LayoutLoad } from '../../../.svelte-kit/types/src/routes/$types';
import { AppSettingsStore } from '../../stores/app/app-settings';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ fetch }): Promise<any> => {
	if (browser) {
		await AppSettingsStore.init(fetch);
	}
};
