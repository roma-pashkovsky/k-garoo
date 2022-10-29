import { cleanAllLocalData } from '../../utils/local-storage-state';
import { clearAppSettingsEndpoint } from './app-settings';
import { auth } from '../login/auth';
import { get } from 'svelte/store';
import { FirebaseUtils } from '../../utils/firebase-utils';

export class CleanDataStore {
	public async cleanAllData(): Promise<void> {
		await clearAppSettingsEndpoint();
		if (get(auth).user) {
			await this.cleanDataAPI();
			await new FirebaseUtils().removeUser();
			auth.set({ isResolved: true, user: null });
		}
		cleanAllLocalData();
	}

	private async cleanDataAPI(): Promise<any> {
		return fetch('/api/v1/clean-data', { method: 'POST' });
	}
}
