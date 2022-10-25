import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { UserSearchManager } from '../../../../../utils/api/user-search-manager';
import { getQueryParamFromUrl } from '../../../../../utils/get-query-param-from-url';
import { invalidAuth } from '../../../../../utils/api/responses';
import { readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import { stopListAgainstMePath, usersBySharedListPath } from '../../../../../utils/api/db-paths';
import type { StopListAgainstMe, UsersBySharedList } from '../../../../../types/fb-database';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId = params.listId;
	try {
		UserSearchManager.init();
		const search = getQueryParamFromUrl('search', request.url);
		if (!search || search.length < 2) {
			return new Response(JSON.stringify([]), {
				statusText: 'Search should be at least 3 chars long'
			});
		}
		let searched = UserSearchManager.search(search);
		const stopListAgainstMe = await readOnceAdmin<StopListAgainstMe>(
			stopListAgainstMePath(user.uid)
		);
		if (stopListAgainstMe) {
			searched = searched.filter((item) => !stopListAgainstMe[item.id]);
		}
		const usersBySharedList = await readOnceAdmin<UsersBySharedList>(
			usersBySharedListPath(listId as string)
		);
		let res: any[];
		if (usersBySharedList) {
			res = searched.map((user) => ({ ...user, isShared: !!usersBySharedList[user.id] }));
		} else {
			res = searched.map((user) => ({ ...user, isShared: false }));
		}
		return json(res);
	} catch (err) {
		console.error(err);
		return new Response('Internal server error', { status: 500 });
	}
};
