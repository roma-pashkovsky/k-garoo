import type { RequestHandler } from '@sveltejs/kit';
import type { CheckListItem } from '../../../../types';
import type { CategoryOptionsByUser } from '../../../../types/fb-database';
import type { FirebaseSetItem } from '../../../../types/firebase-utils';
import type { UsersByList } from '../../../../types/fb-database';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import type { SyncRequest } from '../../../../utils/api/client/sync';
import {
	existsAdmin,
	getTimestamp,
	readOnceAdmin,
	setAdmin
} from '../../../../utils/api/firebase-admin-utils';
import {
	categoryOptionsByUserPath,
	listByMePath,
	listPath,
	userByListPath
} from '../../../../utils/api/db-paths';
import { arrayToMap } from '../../../../utils/array-to-map';
import { getListInsertOrderByUser } from '../../../../utils/api/get-last-list-order-by-user';
import { ORDERING_GAP } from '../../../../utils/api/ordering-gap';
import { UserByListStatus } from '../../../../types';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const syncData: SyncRequest = await request.json();
		if (syncData?.lists?.length) {
			syncData.lists.sort((a, b) => a.created_utc - b.created_utc);
			// sync up to 10 latest lists
			const listsToSync = syncData.lists.slice(0, 10);
			let currInsertOrder = await getListInsertOrderByUser(user.uid);
			for (const list of listsToSync) {
				const listId = list.id;
				const exists = await existsAdmin(listPath(list.id));
				if (!exists) {
					const itemsMap = arrayToMap<CheckListItem>(list.items || [], 'id');
					const settings = syncData.checklistSettings
						? syncData.checklistSettings[listId]
						: undefined;
					const target = {
						...list,
						isGroupByCategory: settings?.isGroupByCategory ?? false,
						items: itemsMap,
						createdById: user.uid,
						created_utc: getTimestamp(),
						updated_utc: getTimestamp()
					};
					await setAdmin([
						{
							path: listByMePath(user.uid, listId),
							value: { updated_ts: getTimestamp(), order: currInsertOrder }
						},
						{ path: listPath(listId), value: target },
						{
							path: userByListPath(listId, user.uid),
							value: { utc: getTimestamp(), status: UserByListStatus.AUTHOR } as UsersByList[string]
						}
					]);
					currInsertOrder += ORDERING_GAP;
				}
			}
		}
		if (syncData?.categoryOptions?.length) {
			// sync up to 10 categories
			const optionsToSync = syncData.categoryOptions.slice(0, 10);
			const optionsByUser = await readOnceAdmin<CategoryOptionsByUser>(
				categoryOptionsByUserPath(user.uid)
			);
			const existingOptionsMap = {};
			if (optionsByUser) {
				Object.keys(optionsByUser).forEach((optionId) => {
					const name = optionsByUser[optionId].name;
					(existingOptionsMap as any)[name.toLowerCase()] = true;
				});
			}
			const optionUpdates: FirebaseSetItem[] = [];
			for (const option of optionsToSync) {
				const name = option.name.toLowerCase();
				if (!(existingOptionsMap as any)[name]) {
					optionUpdates.push({
						path: `${categoryOptionsByUserPath(user.uid)}/${option.id}`,
						value: option
					});
				}
			}
			if (optionUpdates.length) {
				await setAdmin(optionUpdates);
			}
		}
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
