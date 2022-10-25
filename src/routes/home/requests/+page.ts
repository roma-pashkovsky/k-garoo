import type { Load } from '@sveltejs/kit';
import { loadSharedListIds } from '../../../stores/my-shared-lists/my-shared-list.store';

export const load: Load = async ({ fetch }): Promise<any> => {
	await loadSharedListIds(fetch);
};
