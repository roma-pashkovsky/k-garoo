import { browser } from '$app/environment';
import { AuthStore } from '../stores/login/auth.store';
import { getState } from '../utils/local-storage-state';
import { AppSettingsStore } from '../stores/app/app-settings';

export async function load() {
	if (browser) {
		await AuthStore.init();
		await AppSettingsStore.init();
		return {
			status: 301,
			redirect: '/home/lists',
			state: getState()
		};
	}
}
