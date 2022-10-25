import type { RequestHandler } from '@sveltejs/kit';
import type { StopListByMe } from '../../../../types/fb-database';
import type { ListsSharedWithMe } from '../../../../types/fb-database';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../utils/api/firebase-admin-utils';
import { listsSharedWithMePath, stopListByMePath } from '../../../../utils/api/db-paths';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const sharedListsWithMe = await readOnceAdmin<ListsSharedWithMe>(
			listsSharedWithMePath(user.uid)
		);
		if (sharedListsWithMe) {
			let listIds = Object.keys(sharedListsWithMe);
			const blockedUsers = await readOnceAdmin<StopListByMe>(stopListByMePath(user.uid));
			if (blockedUsers) {
				listIds = listIds.filter((listId) => !blockedUsers[sharedListsWithMe[listId].sharedById]);
			}
			listIds.sort((a, b) => sharedListsWithMe[b].updated_utc - sharedListsWithMe[a].updated_utc);
			return json(listIds);
		} else {
			return json([]);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
