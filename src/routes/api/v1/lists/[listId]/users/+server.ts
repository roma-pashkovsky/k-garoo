import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../../utils/api/get-user-from-request';
import {
	badRequest,
	invalidAuth,
	notYourResource,
	serverError
} from '../../../../../../utils/api/responses';
import { existsAdmin, readOnceAdmin } from '../../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	userByListPath,
	usersByListPath
} from '../../../../../../utils/api/db-paths';
import { json } from '@sveltejs/kit';
import type { UsersByList } from '../../../../../../types/fb-database';
import { UserSearchManager } from '../../../../../../utils/api/user-search-manager';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		let isMyList = await existsAdmin(userByListPath(listId, user.uid));
		if (!isMyList) {
			isMyList = await existsAdmin(listByMePath(user.uid, listId));
			if (!isMyList) {
				return notYourResource('Not your list');
			}
		}
		const users = await readOnceAdmin<UsersByList>(usersByListPath(listId));
		if (users && Object.keys(users).length > 1) {
			const ids = Object.keys(users);
			ids.sort((a, b) => users[a].utc - users[b].utc);
			const resp = await UserSearchManager.getNonNullUsers(ids);
			return json(resp);
		} else {
			return json([]);
		}
	} catch (e) {
		console.log(e);
		return serverError();
	}
};
