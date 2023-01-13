import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import type { CheckList, CheckListItem } from '../../../../../types';
import { UserByListStatus } from '../../../../../types';
import type {
	CreateListRequest,
	UpdateListRequest
} from '../../../../../utils/api/client/create-update-list';
import type { FirebaseSetItem } from '../../../../../types/firebase-utils';
import { badRequest, invalidAuth, ok, serverError } from '../../../../../utils/api/responses';
import { existsAdmin, getTimestamp, setAdmin } from '../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listItemPropertyPath,
	listPath,
	listPropertyPath,
	userByListPath
} from '../../../../../utils/api/db-paths';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { arrayToMap } from '../../../../../utils/array-to-map';
import { getChecklistByUserThroughCache } from '../../../../../utils/api/get-checklist-by-user-through-cache';
import type { UsersByList } from '../../../../../types/fb-database';
import { redisSet } from '../../../../../utils/api/redis';
import type { DbChecklist } from '../../../../../types/db-checklist';
import { getListInsertOrderByUser } from '../../../../../utils/api/get-last-list-order-by-user';
import { cleanUserChecklistsCache } from '../../../../../utils/api/get-user-checklists-through-cache';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	const list: CreateListRequest = await request.json();
	if (!list?.items?.length) {
		return badRequest('List should have at least one item');
	}
	if (!list.id || list.id !== listId) {
		return badRequest('Incorrect list id');
	}
	try {
		const exists = await existsAdmin(listPath(listId));
		if (exists) {
			return badRequest('List already exists');
		} else {
			const insertOrder = await getListInsertOrderByUser(user.uid);
			const listByMeRecord: any = { updated_ts: getTimestamp(), order: insertOrder };
			if (list.parentListId) {
				listByMeRecord.parentListId = list.parentListId;
			}
			const itemsMap = arrayToMap<CheckListItem>(list.items || [], 'id');
			const target = {
				...list,
				items: itemsMap,
				createdById: user.uid,
				created_utc: getTimestamp(),
				updated_utc: getTimestamp()
			};
			await setAdmin([
				{
					path: listByMePath(user.uid, listId),
					value: listByMeRecord
				},
				{ path: listPath(listId), value: target },
				{
					path: userByListPath(listId, user.uid),
					value: { utc: getTimestamp(), status: UserByListStatus.AUTHOR } as UsersByList[string]
				}
			]);
			await cleanUserChecklistsCache(user.uid);
			const result = await getChecklistByUserThroughCache(listId, user.uid);
			return json(result);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

const allowedUpdates: { [p in keyof CheckList]?: boolean } = {
	name: true
};
const allowedItemUpdates: { [p in keyof CheckListItem]?: boolean } = {
	category: true,
	checked: true,
	itemDescription: true
};

export const PUT: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		const isMyList = await existsAdmin(listByMePath(user.uid, listId));
		if (!isMyList) {
			return new Response(JSON.stringify({ error: 'Not your list' }), { status: 401 });
		}
		const editRequest: UpdateListRequest = await request.json();
		const updates: FirebaseSetItem[] = [
			{
				path: `${listByMePath(user.uid, listId)}/updated_ts`,
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
						const updatedItem = (itemsUpdate.updated as any)[
							updatedItemId
						] as Partial<CheckListItem>;
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
		const result = await getChecklistByUserThroughCache(listId, user.uid);
		return json(result);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const listId: string = params.listId as string;
	const user = await getUserFromRequest(request);
	try {
		const result = await getChecklistByUserThroughCache(listId, user?.uid);
		return json(result);
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const DELETE: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		await setAdmin([
			{ path: listByMePath(user.uid, listId), value: null },
			{ path: userByListPath(listId, user.uid), value: null }
		]);
		await cleanUserChecklistsCache(user.uid);
		return ok();
	} catch (err) {
		return serverError();
	}
};
