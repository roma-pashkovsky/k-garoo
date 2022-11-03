import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../../../utils/api/responses';
import {
	getTimestamp,
	readOnceAdmin,
	setAdmin
} from '../../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listsByMePath,
	listSharedWithMePath,
	userByListPath,
	userBySharedListPath
} from '../../../../../../utils/api/db-paths';
import type { ListsByUser, UsersByList } from '../../../../../../types/fb-database';
import { UserByListStatus } from '../../../../../../types';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		const lastList = await readOnceAdmin<ListsByUser>(
			listsByMePath(user.uid),
			'order',
			undefined,
			1
		);
		const insertOrder = lastList ? lastList[Object.keys(lastList)[0]].order + 1000 : 0;
		await setAdmin([
			{
				path: listByMePath(user.uid, listId),
				value: {
					updated_ts: getTimestamp(),
					order: insertOrder
				} as ListsByUser[string]
			},
			{
				path: listSharedWithMePath(user.uid, listId),
				value: null
			},
			{
				path: userBySharedListPath(listId, user.uid),
				value: null
			},
			{
				path: userByListPath(listId, user.uid),
				value: {
					utc: getTimestamp(),
					status: UserByListStatus.PARTICIPANT
				} as UsersByList[string]
			}
		]);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
