import type { RequestHandler } from '@sveltejs/kit';
import type {
	ListsByUser,
	ShareListInviteTokenData,
	UsersByList
} from '../../../../../../types/fb-database';
import {
	getTimestamp,
	readOnceAdmin,
	setAdmin
} from '../../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listsByMePath,
	shareListInviteTokenPath,
	userByListPath
} from '../../../../../../utils/api/db-paths';
import { badRequest, invalidAuth, ok, serverError } from '../../../../../../utils/api/responses';
import { getUserFromRequest } from '../../../../../../utils/api/get-user-from-request';
import { UserByListStatus } from '../../../../../../types';
import { ORDERING_GAP } from '../../../../../../utils/api/ordering-gap';
import { redisSet } from '../../../../../../utils/api/redis';
import { getChecklistByUserThroughCache } from '../../../../../../utils/api/get-checklist-by-user-through-cache';
import { json } from '@sveltejs/kit';
import { getListInsertOrderByUser } from '../../../../../../utils/api/get-last-list-order-by-user';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	try {
		const token: string = params.token as string;
		const requestData = await request.json();
		const listId = requestData.listId;
		const tokenEntry = await readOnceAdmin<ShareListInviteTokenData>(
			shareListInviteTokenPath(token)
		);
		if (tokenEntry) {
			if (tokenEntry.listId === listId) {
				const insertOrder = await getListInsertOrderByUser(user.uid);
				const listByMeRecord: any = { updated_ts: getTimestamp(), order: insertOrder };
				await setAdmin([
					{
						path: listByMePath(user.uid, listId),
						value: listByMeRecord
					},
					{
						path: userByListPath(listId, user.uid),
						value: {
							utc: getTimestamp(),
							status: UserByListStatus.PARTICIPANT
						} as UsersByList[string]
					}
				]);
				await redisSet(listId, null);
				const list = getChecklistByUserThroughCache(listId, user.uid);
				return json(list);
			}
			console.log('token list id is different from request list id');
		}
		return badRequest('Could not find data associated with this token');
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
