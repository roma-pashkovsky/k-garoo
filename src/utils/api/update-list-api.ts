import type { FirebaseSetItem } from '../../types/firebase-utils';
import type { UpdateListRequest } from './client/create-update-list';
import type { CheckListItem } from '../../types';
import type { DbChecklist } from '../../types/db-checklist';
import type { CheckList } from '../../types';
import { listByMePath, listItemPropertyPath, listPath, listPropertyPath } from './db-paths';
import { getTimestamp, setAdmin } from './firebase-admin-utils';
import { redisSet } from './redis';

const allowedUpdates: { [p in keyof CheckList]?: boolean } = {
	name: true
};
const allowedItemUpdates: { [p in keyof CheckListItem]?: boolean } = {
	category: true,
	checked: true,
	itemDescription: true
};

export const updateListApi = async (
	userId: string,
	listId: string,
	editRequest: UpdateListRequest
): Promise<void> => {
	const updates: FirebaseSetItem[] = [
		{
			path: `${listByMePath(userId, listId)}/updated_ts`,
			value: getTimestamp()
		}
	];
	Object.keys(editRequest).forEach((updateKey: string) => {
		const castKey = updateKey as keyof UpdateListRequest;
		if (updateKey === 'items') {
			const itemsUpdate = editRequest[castKey] as UpdateListRequest['items'];
			if (itemsUpdate?.added) {
				itemsUpdate.added.forEach((addedItem) => {
					updates.push({
						path: `${listPropertyPath(listId, 'items')}/${addedItem.id}`,
						value: addedItem
					});
				});
			}
			if (itemsUpdate?.updated) {
				Object.keys(itemsUpdate.updated).forEach((updatedItemId) => {
					const updatedItem = (itemsUpdate.updated as any)[updatedItemId] as Partial<CheckListItem>;
					Object.keys(updatedItem)
						.filter((prop) => !!allowedItemUpdates[prop as keyof CheckListItem])
						.forEach((updatedItemProp) => {
							updates.push({
								path: listItemPropertyPath(
									listId,
									updatedItemId,
									updatedItemProp as keyof CheckListItem
								),
								value: updatedItem[updatedItemProp as keyof CheckListItem] || null
							});
						});
				});
			}
			if (itemsUpdate?.removed) {
				itemsUpdate.removed.forEach((removedId) => {
					updates.push({
						path: `${listPath(listId)}/items/${removedId}`,
						value: null
					});
				});
			}
		} else if (allowedUpdates[castKey]) {
			updates.push({
				path: listPropertyPath(listId, updateKey as keyof DbChecklist),
				value: editRequest[castKey]
			});
		}
	}); // eof Object.keys
	await setAdmin(updates);
	await redisSet(listId, null);
};
