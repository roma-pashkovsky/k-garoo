import type { RequestHandler } from '@sveltejs/kit';
import { getUserFromRequest } from '../../../../../../utils/api/get-user-from-request';
import { invalidAuth, ok, serverError } from '../../../../../../utils/api/responses';
import { getTimestamp, setAdmin } from '../../../../../../utils/api/firebase-admin-utils';
import {
	listByMePath,
	listSharedWithMePath,
	userBySharedListPath
} from '../../../../../../utils/api/db-paths';

export const POST: RequestHandler = async ({ request, params }): Promise<Response> => {
	const user = await getUserFromRequest(request);
	if (!user) {
		return invalidAuth();
	}
	const listId: string = params.listId as string;
	try {
		await setAdmin([
			{
				path: listByMePath(user.uid, listId),
				value: {
					updated_ts: getTimestamp()
				}
			},
			{
				path: listSharedWithMePath(user.uid, listId),
				value: null
			},
			{
				path: userBySharedListPath(listId, user.uid),
				value: null
			}
		]);
		return ok();
	} catch (err) {
		console.log(err);
		return serverError();
	}
};
