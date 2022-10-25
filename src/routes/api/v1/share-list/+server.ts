import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../utils/api/responses';
import { existsAdmin, getTimestamp, setAdmin } from '../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listSharedWithMePath,
	recentUserPath,
	recentUsersPath,
	stopListByMeByUserPath,
	userBySharedListPath
} from '../../../../utils/api/db-paths';
import type { ShareListRequest } from '../../../../utils/api/client/share-list';
import type { ListsSharedWithMe, RecentUsers } from '../../../../types/fb-database';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const body: ShareListRequest = await request.json();
		const isStopList = await existsAdmin(stopListByMeByUserPath(user.uid, body.userId));
		if (isStopList) {
			return new Response(JSON.stringify({ error: 'Stop list' }), { status: 401 });
		} else {
			const isMyList = await existsAdmin(listByMePath(user.uid, body.listId));
			if (!isMyList) {
				return new Response(JSON.stringify({ error: 'Not your list' }), { status: 401 });
			}
			await setAdmin([
				{
					path: listSharedWithMePath(body.userId, body.listId),
					value: {
						sharedById: user.uid,
						updated_utc: getTimestamp()
					} as ListsSharedWithMe[string]
				},
				{
					path: userBySharedListPath(body.listId, body.userId),
					value: body.userId
				},
				{
					path: recentUserPath(user.uid, body.userId),
					value: {
						updated_utc: getTimestamp()
					} as RecentUsers[string]
				}
			]);
			return ok();
		}
	} catch (err) {
		console.log(err);
		return serverError();
	}
};

export const DELETE: RequestHandler = async ({ request }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const body: ShareListRequest = await request.json();
		const isMyList = await existsAdmin(listByMePath(user.uid, body.listId));
		if (!isMyList) {
			return new Response(JSON.stringify({ error: 'Not your list' }), { status: 401 });
		}
		await setAdmin([
			{
				path: listSharedWithMePath(body.userId, body.listId),
				value: null
			},
			{
				path: userBySharedListPath(body.listId, body.userId),
				value: null
			}
		]);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
