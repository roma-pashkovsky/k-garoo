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
import { validateChecklist } from './validate-checklist';
import { getChildListIdForList } from './get-child-list-id-for-list';

export const getChecklistDataThroughCache = async (listId: string): Promise<DbChecklist> => {
	let listData = await redisGet<DbChecklist>(listId);
	if (!listData) {
		listData = await readOnceAdmin<DbChecklist>(listPath(listId));
		if (listData) {
			redisSet(listId, listData);
		}
	}
	return listData;
};

export const getChecklistByUserThroughCache = async (
	listId: string,
	userId: string | undefined
): Promise<ChecklistWithSettings | null> => {
	let listData = await getChecklistDataThroughCache(listId);
	if (!listData) {
		return null;
	}
	listData = await validateChecklist(listData);
	let isMyList = false;
	let childListId: string | null = null;
	let sharedBy = null;
	let byUserIsGroupByCategory: boolean | undefined;
	let byUserHideCrossedOut: boolean | undefined;
	let byUserIsCalcMode: boolean | undefined;
	if (userId) {
		isMyList = await existsAdmin(listByMePath(userId, listId));
		if (!isMyList) {
			childListId = await getChildListIdForList(userId, listId);
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
		byUserIsCalcMode = byUserSettings?.isCalcMode;
	}
	const items = Object.values(listData.items);
	items.sort((a, b) => a.orderAdded - b.orderAdded);
	let result: ChecklistWithSettings = {
		...listData,
		items,
		isMyList,
		isGroupByCategory: byUserIsGroupByCategory ?? listData.isGroupByCategory,
		hideCrossedOut: byUserHideCrossedOut ?? false,
		isCalcMode: byUserIsCalcMode ?? listData.isCalcMode ?? false,
		childListId
	};
	if (sharedBy) {
		result = { ...result, sharedBy };
	}
	return result;
};
