import type { Load } from '@sveltejs/kit';
import { loadStopListUsers } from '../../../stores/stop-list/stop-list.store';

export const load: Load = async ({ fetch }): Promise<any> => {
	await loadStopListUsers(fetch);
};
