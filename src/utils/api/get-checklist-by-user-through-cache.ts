import type { ChecklistSettings, ChecklistWithSettings } from '../../types';
import { existsAdmin, readOnceAdmin } from './firebase-admin-utils';
import type { DbChecklist } from '../../types/db-checklist';
import {
	listByMePath,
	listPath,
	listSettingsByMeByListPath,
	listSharedWithMePath,
	userPath
} from './db-paths';
import type { ListsSharedWithMe } from '../../types/fb-database';
import type { AppUser } from '../../types/auth';
import { redisGet, redisSet } from './redis';

export const getChecklistByUserThroughCache = async (
	listId: string,
	userId: string | undefined
): Promise<ChecklistWithSettings | null> => {
	let listData = await redisGet<DbChecklist>(listId);
	if (!listData) {
		console.log('fetched list data from db');
		listData = await readOnceAdmin<DbChecklist>(listPath(listId));
		if (listData) {
			redisSet(listId, listData);
		}
	} else {
		console.log('fetched list data from redis');
	}
	if (!listData) {
		return null;
	}
	let isMyList = false;
	let sharedBy = null;
	let byUserIsGroupByCategory: boolean | undefined;
	let byUserHideCrossedOut: boolean | undefined;
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

		const byUserSettings = await readOnceAdmin<ChecklistSettings>(
			listSettingsByMeByListPath(userId, listId)
		);
		byUserIsGroupByCategory = byUserSettings?.isGroupByCategory;
		byUserHideCrossedOut = byUserSettings?.hideCrossedOut;
	}
	const items = Object.values(listData.items);
	items.sort((a, b) => a.orderAdded - b.orderAdded);
	let result: ChecklistWithSettings = {
		...listData,
		items,
		isMyList,
		isGroupByCategory: byUserIsGroupByCategory ?? listData.isGroupByCategory,
		hideCrossedOut: byUserHideCrossedOut ?? false
	};
	if (sharedBy) {
		result = { ...result, sharedBy };
	}
	return result;
};
