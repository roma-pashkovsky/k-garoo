import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../utils/api/get-user-from-request';
import { invalidAuth, serverError } from '../../../../../utils/api/responses';
import { existsAdmin, readOnceAdmin } from '../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	recentUsersPath,
	stopListAgainstMePath,
	userPath,
	usersBySharedListPath
} from '../../../../../utils/api/db-paths';
import { json } from '@sveltejs/kit';
import type { StopListAgainstMe, UsersBySharedList } from '../../../../../types/fb-database';
import type { ShareListUser } from '../../../../../types/share-list';
import type { AppUser } from '../../../../../types/auth';

export const GET: RequestHandler = async ({ request, params }): Promise<Response> => {
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
		const recent = await readOnceAdmin(recentUsersPath(user.uid), 'updated_utc', undefined, 5);
		if (recent) {
			let userIds = Object.keys(recent);
			const stopAgainstMe = await readOnceAdmin<StopListAgainstMe>(stopListAgainstMePath(user.uid));
			if (stopAgainstMe) {
				userIds = userIds.filter((uid) => !stopAgainstMe[uid]);
			}
			const promises = userIds.map((userId) => readOnceAdmin<AppUser>(userPath(userId)));
			const users: AppUser[] = await Promise.all(promises);
			const usersBySharedList = await readOnceAdmin<UsersBySharedList>(
				usersBySharedListPath(listId as string)
			);
			let res: ShareListUser[];
			if (usersBySharedList) {
				res = users.map((u) => ({ ...u, isShared: !!usersBySharedList[u.id] }));
			} else {
				res = users.map((u) => ({ ...u, isShared: false }));
			}
			return json(res);
		} else {
			return json([]);
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
