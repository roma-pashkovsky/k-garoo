import { listByMePath } from './db-paths';
import type { FirebaseSetItem } from '../../types/firebase-utils';
import { setAdmin } from './firebase-admin-utils';
import { cleanUserChecklistsCache } from './get-user-checklists-through-cache';

export const reorderListApi = async (userId: string, listIds: string[]): Promise<void> => {
	const l = listIds.length - 1;
	const updates = listIds.map((listId, ind) => {
		return {
			path: `${listByMePath(userId, listId)}/order`,
			value: (l - ind) * 1000
		} as FirebaseSetItem;
	});
	await setAdmin(updates);
	await cleanUserChecklistsCache(userId);
};
