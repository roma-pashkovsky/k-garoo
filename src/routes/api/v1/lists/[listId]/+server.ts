import type { RequestHandler } from '@sveltejs/kit';
import type { CheckList, CheckListItem } from '../../../../../types';
import type { CreateListRequest } from '../../../../../utils/api/client/create-update-list';
import type { UpdateListRequest } from '../../../../../utils/api/client/create-update-list';
import type { FirebaseSetItem } from '../../../../../types/firebase-utils';
import { json } from '@sveltejs/kit';
import { invalidAuth, serverError } from '../../../../../utils/api/responses';
import { existsAdmin, getTimestamp, setAdmin } from '../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listItemPropertyPath,
	listPath,
	listPropertyPath
} from '../../../../../utils/api/db-paths';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { arrayToMap } from '../../../../../utils/array-to-map';
import { getChecklistByUser } from '../../../../../utils/api/get-checklist-by-user';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	const list: CreateListRequest = await request.json();
	if (!list?.items?.length) {
		return new Response(JSON.stringify({ error: 'List should have at least one item' }), {
			status: 401
		});
	}
	if (!list.id || list.id !== listId) {
		return new Response(JSON.stringify({ error: 'Incorrect list id' }), {
			status: 401
		});
	}
	try {
		const exists = await existsAdmin(listPath(listId));
		if (exists) {
			return new Response(JSON.stringify({ error: 'List already exists' }), { status: 401 });
		} else {
			const itemsMap = arrayToMap<CheckListItem>(list.items || [], 'id');
			const target = { ...list, items: itemsMap };
			await setAdmin([
				{ path: listByMePath(user.uid, listId), value: { updated_ts: getTimestamp() } },
				{ path: listPath(listId), value: target }
			]);
			const result = await getChecklistByUser(listId, user.uid);
			return json(result);
		}
	} catch (err) {
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
		const updates: FirebaseSetItem[] = [];
		Object.keys(editRequest).forEach((updateKey: string) => {
			const castKey = updateKey as keyof UpdateListRequest;
			if (updateKey === 'items') {
				const itemsUpdate = editRequest[castKey] as UpdateListRequest['items'];
				if (itemsUpdate.added) {
					itemsUpdate.added.forEach((addedItem) => {
						updates.push({
							path: `${listPropertyPath(listId, 'items')}/${addedItem.id}`,
							value: addedItem
						});
					});
				}
				if (itemsUpdate.updated) {
					Object.keys(itemsUpdate.updated).forEach((updatedItemId) => {
						const updatedItem = itemsUpdate.updated[updatedItemId] as Partial<CheckListItem>;
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
				if (itemsUpdate.removed) {
					itemsUpdate.removed.forEach((removedId) => {
						updates.push({
							path: `${listPath(listId)}/items/${removedId}`,
							value: null
						});
					});
				}
			} else if (allowedUpdates[castKey]) {
				updates.push({
					path: listPropertyPath(listId, updateKey as keyof CheckList),
					value: editRequest[castKey]
				});
			}
		}); // eof Object.keys
		await setAdmin(updates);
		const result = await getChecklistByUser(listId, user.uid);
		return json(result);
	} catch (err) {
		return serverError();
	}
};

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const listId: string = params.listId as string;
	const user = await getUserFromRequest(request);
	try {
		const result = await getChecklistByUser(listId, user?.uid);
		return json(result);
	} catch (err) {
		return serverError();
	}
};
