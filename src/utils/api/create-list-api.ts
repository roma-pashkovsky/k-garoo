import { getListInsertOrderByUser } from './get-last-list-order-by-user';
import { getTimestamp, setAdmin } from './firebase-admin-utils';
import { arrayToMap } from '../array-to-map';
import type { CheckListItem } from '../../types';
import { UserByListStatus } from '../../types';
import { listByMePath, listPath, userByListPath } from './db-paths';
import type { UsersByList } from '../../types/fb-database';
import { cleanUserChecklistsCache } from './get-user-checklists-through-cache';
import type { CreateListRequest } from './client/create-update-list';

export const createListApi = async (userId: string, list: CreateListRequest): Promise<void> => {
	const listId: string = list.id as string;
	const insertOrder = await getListInsertOrderByUser(userId);
	const listByMeRecord: any = { updated_ts: getTimestamp(), order: insertOrder };
	if (list.parentListId) {
		listByMeRecord.parentListId = list.parentListId;
	}
	const itemsMap = arrayToMap<CheckListItem>(list.items || [], 'id');
	const target = {
		...list,
		items: itemsMap,
		createdById: userId,
		created_utc: getTimestamp(),
		updated_utc: getTimestamp()
	};
	await setAdmin([
		{
			path: listByMePath(userId, listId),
			value: listByMeRecord
		},
		{ path: listPath(listId), value: target },
		{
			path: userByListPath(listId, userId),
			value: { utc: getTimestamp(), status: UserByListStatus.AUTHOR } as UsersByList[string]
		}
	]);
	await cleanUserChecklistsCache(userId);
};
