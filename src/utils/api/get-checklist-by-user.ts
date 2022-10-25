import type { CheckList } from '../../types';
import { existsAdmin, readOnceAdmin } from './firebase-admin-utils';
import type { DbChecklist } from '../../types/db-checklist';
import { listByMePath, listPath, listSharedWithMePath, userPath } from './db-paths';
import type { ListsSharedWithMe } from '../../types/fb-database';
import type { AppUser } from '../../types/auth';

export const getChecklistByUser = async (
	listId: string,
	userId: string | undefined
): Promise<CheckList | null> => {
	const listData = await readOnceAdmin<DbChecklist>(listPath(listId));
	if (!listData) {
		return null;
	}
	let isMyList = false;
	let sharedBy = null;
	if (userId) {
		isMyList = await existsAdmin(listByMePath(userId, listId));
		if (!isMyList) {
			const sharedByObj = await readOnceAdmin<ListsSharedWithMe[string]>(
				listSharedWithMePath(userId, listId)
			);
			if (sharedByObj) {
				sharedBy = await readOnceAdmin<AppUser>(userPath(sharedByObj.sharedById));
			}
		}
	}
	const items = Object.values(listData.items);
	items.sort((a, b) => a.orderAdded - b.orderAdded);
	let result: CheckList = { ...listData, items, isMyList };
	if (sharedBy) {
		result = { ...result, sharedBy };
	}
	return result;
};
